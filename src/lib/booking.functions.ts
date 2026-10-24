import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  assertBookableStart,
  availabilitySchema,
  bookingStatusSchema,
  bookingWindow,
  buildBookingRecord,
  createBookingSchema,
  dayBounds,
  evaluateSlots,
  interpretBookingInsertError,
  pickProfessional,
  weekdayFromDate,
  type AvailabilityInput,
  type BookingStatus,
  type CreateBookingInput,
} from "@/lib/booking-rules";

// Public read-only Supabase client (anon key) — used for public reads during SSR
function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

// ================================================================
// PUBLIC
// ================================================================

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("services")
    .select("id,slug,name,description,duration_minutes,sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listProfessionals = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("professionals")
    .select("id,name,bio,sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getAvailability = createServerFn({ method: "POST" })
  .inputValidator((d: AvailabilityInput) => availabilitySchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: svc, error: svcErr } = await sb
      .from("services")
      .select("duration_minutes")
      .eq("id", data.serviceId)
      .maybeSingle();
    if (svcErr || !svc) throw new Error("Service not found");
    const duration = svc.duration_minutes;

    // Determine pros to consider
    const proQuery = sb.from("professionals").select("id").eq("active", true);
    if (data.professionalId) proQuery.eq("id", data.professionalId);
    const { data: pros, error: proErr } = await proQuery;
    if (proErr) throw new Error(proErr.message);
    if (!pros || pros.length === 0) return { date: data.date, slots: [] };

    const weekday = weekdayFromDate(data.date);

    // Fetch working hours for these pros on this weekday
    const proIds = pros.map((p) => p.id);
    const { data: wh } = await sb
      .from("working_hours")
      .select("professional_id,open_time,close_time")
      .in("professional_id", proIds)
      .eq("weekday", weekday);

    // Fetch blocks intersecting the day
    const { dayStart, dayEnd } = dayBounds(data.date);
    const { data: blocks } = await sb
      .from("time_blocks")
      .select("professional_id,starts_at,ends_at")
      .lt("starts_at", dayEnd)
      .gt("ends_at", dayStart);
    const { data: bookings } = await sb
      .from("bookings")
      .select("professional_id,starts_at,ends_at,status")
      .neq("status", "cancelled")
      .lt("starts_at", dayEnd)
      .gt("ends_at", dayStart);

    const slots = evaluateSlots({
      date: data.date,
      durationMinutes: duration,
      professionalId: data.professionalId,
      workingHours: wh ?? [],
      blocks: blocks ?? [],
      bookings: bookings ?? [],
      nowMs: Date.now(),
    });

    return { date: data.date, slots };
  });

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((d: CreateBookingInput) => createBookingSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: svc } = await sb
      .from("services")
      .select("duration_minutes,name")
      .eq("id", data.serviceId)
      .maybeSingle();
    if (!svc) throw new Error("Service not found");

    const { starts_at, ends_at } = bookingWindow(data.date, data.time, svc.duration_minutes);
    assertBookableStart(starts_at, Date.now());

    // Pick professional: if not specified, pick first eligible free one
    let professionalId = data.professionalId;
    if (!professionalId) {
      const weekday = weekdayFromDate(data.date);
      const { data: wh } = await sb
        .from("working_hours")
        .select("professional_id,open_time,close_time")
        .eq("weekday", weekday);
      const { data: bookings } = await sb
        .from("bookings")
        .select("professional_id,starts_at,ends_at")
        .neq("status", "cancelled")
        .lt("starts_at", ends_at)
        .gt("ends_at", starts_at);
      const { data: blocks } = await sb
        .from("time_blocks")
        .select("professional_id,starts_at,ends_at")
        .lt("starts_at", ends_at)
        .gt("ends_at", starts_at);
      professionalId = pickProfessional({
        time: data.time,
        durationMinutes: svc.duration_minutes,
        workingHours: wh ?? [],
        blocks: blocks ?? [],
        bookings: bookings ?? [],
      });
    }

    const record = buildBookingRecord({
      serviceId: data.serviceId,
      professionalId,
      starts_at,
      ends_at,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      notes: data.notes ?? null,
    });

    const { data: inserted, error } = await sb
      .from("bookings")
      .insert(record)
      .select("id")
      .single();
    if (error) throw interpretBookingInsertError(error);
    return { id: inserted!.id, serviceName: svc.name, starts_at, ends_at, professionalId };
  });

// ================================================================
// ADMIN
// ================================================================

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden");
}

export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*, services(name), professionals(name)")
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminSetBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: BookingStatus }) =>
    z.object({ id: z.string().uuid(), status: bookingStatusSchema }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListWorkingHours = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("working_hours")
      .select("*")
      .order("weekday");
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpsertWorkingHour = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { professional_id: string; weekday: number; open_time: string; close_time: string }) =>
      z
        .object({
          professional_id: z.string().uuid(),
          weekday: z.number().int().min(0).max(6),
          open_time: z.string().regex(/^\d{2}:\d{2}$/),
          close_time: z.string().regex(/^\d{2}:\d{2}$/),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("working_hours")
      .upsert(
        { ...data, open_time: data.open_time + ":00", close_time: data.close_time + ":00" },
        { onConflict: "professional_id,weekday" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteWorkingHour = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { professional_id: string; weekday: number }) =>
    z
      .object({ professional_id: z.string().uuid(), weekday: z.number().int().min(0).max(6) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("working_hours")
      .delete()
      .eq("professional_id", data.professional_id)
      .eq("weekday", data.weekday);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListBlocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("time_blocks")
      .select("*, professionals(name)")
      .order("starts_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminCreateBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { professional_id: string | null; starts_at: string; ends_at: string; reason?: string }) =>
      z
        .object({
          professional_id: z.string().uuid().nullable(),
          starts_at: z.string(),
          ends_at: z.string(),
          reason: z.string().trim().max(200).optional(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("time_blocks").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("time_blocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("services").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpsertService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string;
      slug: string;
      name: string;
      description?: string;
      duration_minutes: number;
      sort_order: number;
      active: boolean;
    }) =>
      z
        .object({
          id: z.string().uuid().optional(),
          slug: z.string().trim().min(1).max(80),
          name: z.string().trim().min(1).max(120),
          description: z.string().trim().max(500).optional().nullable(),
          duration_minutes: z.number().int().min(15).max(600),
          sort_order: z.number().int(),
          active: z.boolean(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("services").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListProfessionals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("professionals")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpsertProfessional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { id?: string; name: string; bio?: string; sort_order: number; active: boolean }) =>
      z
        .object({
          id: z.string().uuid().optional(),
          name: z.string().trim().min(1).max(120),
          bio: z.string().trim().max(500).optional().nullable(),
          sort_order: z.number().int(),
          active: z.boolean(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("professionals").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProfessional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("professionals").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
