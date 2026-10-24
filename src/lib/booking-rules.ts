import { z } from "zod";

/** Minutes between candidate start times. Matches the booking screen grid. */
export const SLOT_STEP_MINUTES = 30;

export const bookingStatusSchema = z.enum(["pending", "confirmed", "cancelled"]);

export type BookingStatus = z.infer<typeof bookingStatusSchema>;

export const availabilitySchema = z.object({
  serviceId: z.string().uuid(),
  professionalId: z.string().uuid().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  professionalId: z.string().uuid().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().min(6).max(30),
  customerEmail: z.string().trim().email().max(200),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export type WorkingHourWindow = {
  professional_id: string;
  open_time: string;
  close_time: string;
};

export type TimeInterval = {
  professional_id: string | null;
  starts_at: string;
  ends_at: string;
};

export type ScheduleBooking = TimeInterval & {
  status?: string | null;
};

/**
 * Interpret date+time as Europe/Lisbon wall-clock, stored as ISO Z labels
 * (single-salon in one timezone — consistent client<->server).
 */
export function wallClockISO(dateISO: string, timeHHMM: string): string {
  return `${dateISO}T${timeHHMM}:00.000Z`;
}

export function addMinutesISO(iso: string, minutes: number): string {
  const d = new Date(iso);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d.toISOString();
}

/** Half-open overlap: ranges that only touch at an endpoint do not conflict. */
export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function weekdayFromDate(dateISO: string): number {
  return new Date(`${dateISO}T12:00:00Z`).getUTCDay();
}

export function dayBounds(dateISO: string): { dayStart: string; dayEnd: string } {
  return {
    dayStart: wallClockISO(dateISO, "00:00"),
    dayEnd: wallClockISO(dateISO, "23:59"),
  };
}

export function bookingWindow(
  dateISO: string,
  timeHHMM: string,
  durationMinutes: number,
): { starts_at: string; ends_at: string } {
  const starts_at = wallClockISO(dateISO, timeHHMM);
  const ends_at = addMinutesISO(starts_at, durationMinutes);
  return { starts_at, ends_at };
}

export function assertBookableStart(startsAt: string, nowMs: number): void {
  if (new Date(startsAt).getTime() < nowMs) throw new Error("Cannot book in the past");
}

export function bookingOccupiesSlot(status: BookingStatus): boolean {
  switch (status) {
    case "pending":
    case "confirmed":
      return true;
    case "cancelled":
      return false;
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
}

/** Missing status still occupies: callers that pre-filter pass rows without a status. */
export function rowOccupiesSlot(row: { status?: string | null }): boolean {
  if (row.status === "pending" || row.status === "confirmed" || row.status === "cancelled") {
    return bookingOccupiesSlot(row.status);
  }
  return row.status !== "cancelled";
}

export function bookingsThatOccupy<T extends { status?: string | null }>(rows: readonly T[]): T[] {
  return rows.filter((row) => rowOccupiesSlot(row));
}

export function cancelBooking<T extends { status: BookingStatus }>(booking: T): T {
  return { ...booking, status: "cancelled" };
}

export function confirmBooking<T extends { status: BookingStatus }>(booking: T): T {
  return { ...booking, status: "confirmed" };
}

function clockMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function fitsWorkingWindow(
  startMinutes: number,
  durationMinutes: number,
  openTime: string,
  closeTime: string,
): boolean {
  const open = clockMinutes(openTime);
  const close = clockMinutes(closeTime);
  return startMinutes >= open && startMinutes + durationMinutes <= close;
}

export function candidateSlotTimes(
  workingHours: readonly WorkingHourWindow[],
  durationMinutes: number,
): string[] {
  const slotTimes = new Set<string>();
  for (const window of workingHours) {
    let cursor = clockMinutes(window.open_time);
    const close = clockMinutes(window.close_time);
    while (cursor + durationMinutes <= close) {
      const hh = String(Math.floor(cursor / 60)).padStart(2, "0");
      const mm = String(cursor % 60).padStart(2, "0");
      slotTimes.add(`${hh}:${mm}`);
      cursor += SLOT_STEP_MINUTES;
    }
  }
  return [...slotTimes].sort();
}

export function intervalConflicts(
  start: string,
  end: string,
  professionalId: string,
  blocks: readonly TimeInterval[],
  bookings: readonly ScheduleBooking[],
): boolean {
  const hasBlock = blocks.some(
    (block) =>
      (block.professional_id === null || block.professional_id === professionalId) &&
      overlaps(start, end, block.starts_at, block.ends_at),
  );
  if (hasBlock) return true;
  return bookingsThatOccupy(bookings).some(
    (booking) =>
      booking.professional_id === professionalId &&
      overlaps(start, end, booking.starts_at, booking.ends_at),
  );
}

export function evaluateSlots(input: {
  date: string;
  durationMinutes: number;
  professionalId: string | null;
  workingHours: readonly WorkingHourWindow[];
  blocks: readonly TimeInterval[];
  bookings: readonly ScheduleBooking[];
  nowMs: number;
}): Array<{ time: string; available: boolean }> {
  return candidateSlotTimes(input.workingHours, input.durationMinutes).map((time) => {
    const start = wallClockISO(input.date, time);
    const end = addMinutesISO(start, input.durationMinutes);
    if (new Date(start).getTime() < input.nowMs) return { time, available: false };

    const startMinutes = clockMinutes(time);
    const eligible = input.workingHours.filter((window) => {
      if (input.professionalId && window.professional_id !== input.professionalId) return false;
      return fitsWorkingWindow(
        startMinutes,
        input.durationMinutes,
        window.open_time,
        window.close_time,
      );
    });

    const anyFree = eligible.some(
      (window) =>
        !intervalConflicts(start, end, window.professional_id, input.blocks, input.bookings),
    );
    return { time, available: anyFree };
  });
}

/**
 * Pick the first professional whose hours cover the service.
 * Bookings and blocks are the rows already limited to this interval by the query:
 * any row for that professional means the slot is busy. Cancelled bookings do not count.
 */
export function pickProfessional(input: {
  time: string;
  durationMinutes: number;
  workingHours: readonly WorkingHourWindow[];
  blocks: readonly TimeInterval[];
  bookings: readonly ScheduleBooking[];
}): string {
  const startMinutes = clockMinutes(input.time);
  const eligible = input.workingHours.filter((window) =>
    fitsWorkingWindow(startMinutes, input.durationMinutes, window.open_time, window.close_time),
  );
  const bookings = bookingsThatOccupy(input.bookings);
  for (const window of eligible) {
    const busy =
      bookings.some((booking) => booking.professional_id === window.professional_id) ||
      input.blocks.some(
        (block) =>
          block.professional_id === null || block.professional_id === window.professional_id,
      );
    if (!busy) return window.professional_id;
  }
  throw new Error("No professional available at that time");
}

export function buildBookingRecord(input: {
  serviceId: string;
  professionalId: string;
  starts_at: string;
  ends_at: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string | null;
}) {
  return {
    service_id: input.serviceId,
    professional_id: input.professionalId,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    status: "pending" as const,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail,
    notes: input.notes ?? null,
  };
}

export function interpretBookingInsertError(error: {
  message: string;
  code?: string | null;
}): Error {
  if (error.message.toLowerCase().includes("no_overlap") || error.code === "23P01") {
    return new Error("This time slot was just taken. Please pick another.");
  }
  return new Error(error.message);
}
