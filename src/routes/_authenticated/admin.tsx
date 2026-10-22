import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListBookings,
  adminSetBookingStatus,
  adminListWorkingHours,
  adminUpsertWorkingHour,
  adminListBlocks,
  adminCreateBlock,
  adminDeleteBlock,
  adminListServices,
  adminUpsertService,
  adminDeleteService,
  adminListProfessionals,
  adminUpsertProfessional,
  adminDeleteProfessional,
} from "@/lib/booking.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin — Studio Demo" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"bookings" | "hours" | "blocks" | "services" | "pros">("bookings");

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  }

  return (
    <div className="pt-32 md:pt-36 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <div className="eyebrow">Salon Dashboard</div>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl">Manage</h1>
          </div>
          <button
            onClick={signOut}
            className="text-xs uppercase tracking-[0.28em] text-foreground/60 hover:text-foreground"
          >
            Sign out
          </button>
        </div>

        <div className="mt-10 flex flex-wrap gap-6 border-b border-border">
          {[
            ["bookings", "Bookings"],
            ["hours", "Hours"],
            ["blocks", "Time Off"],
            ["services", "Services"],
            ["pros", "Professionals"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k as any)}
              className={`pb-3 text-xs uppercase tracking-[0.28em] border-b-2 transition-colors ${tab === k ? "border-foreground text-foreground" : "border-transparent text-foreground/50 hover:text-foreground"}`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {tab === "bookings" && <BookingsTab />}
          {tab === "hours" && <HoursTab />}
          {tab === "blocks" && <BlocksTab />}
          {tab === "services" && <ServicesTab />}
          {tab === "pros" && <ProsTab />}
        </div>
      </div>
    </div>
  );
}

function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

function BookingsTab() {
  const fn = useServerFn(adminListBookings);
  const setStatus = useServerFn(adminSetBookingStatus);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => fn(),
  });
  const mut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "confirmed" | "cancelled" }) =>
      setStatus({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  if (isLoading) return <div className="text-sm text-foreground/60">Loading…</div>;
  if (error) return <div className="text-sm text-destructive">{(error as Error).message}</div>;
  if (!data?.length) return <div className="text-sm text-foreground/60">No bookings yet.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["When", "Service", "Pro", "Customer", "Contact", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left py-3 pr-4 eyebrow">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((b: any) => (
            <tr key={b.id} className="border-b border-border/60 align-top">
              <td className="py-4 pr-4 whitespace-nowrap">{fmt(b.starts_at)}</td>
              <td className="py-4 pr-4">{b.services?.name}</td>
              <td className="py-4 pr-4">{b.professionals?.name}</td>
              <td className="py-4 pr-4">{b.customer_name}</td>
              <td className="py-4 pr-4 text-xs text-foreground/60">
                {b.customer_email}
                <br />
                {b.customer_phone}
              </td>
              <td className="py-4 pr-4">
                <span
                  className={`px-2 py-1 text-xs uppercase tracking-wider ${b.status === "confirmed" ? "bg-foreground text-background" : b.status === "cancelled" ? "line-through text-foreground/40" : "bg-surface"}`}
                >
                  {b.status}
                </span>
              </td>
              <td className="py-4 pr-4 space-x-2 whitespace-nowrap">
                {b.status !== "confirmed" && (
                  <button
                    onClick={() => mut.mutate({ id: b.id, status: "confirmed" })}
                    className="text-xs underline"
                  >
                    Confirm
                  </button>
                )}
                {b.status !== "cancelled" && (
                  <button
                    onClick={() => mut.mutate({ id: b.id, status: "cancelled" })}
                    className="text-xs underline text-destructive"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HoursTab() {
  const proFn = useServerFn(adminListProfessionals);
  const hFn = useServerFn(adminListWorkingHours);
  const upFn = useServerFn(adminUpsertWorkingHour);
  const qc = useQueryClient();
  const { data: pros } = useQuery({ queryKey: ["admin-pros"], queryFn: () => proFn() });
  const { data: hours } = useQuery({ queryKey: ["admin-hours"], queryFn: () => hFn() });
  const mut = useMutation({
    mutationFn: (v: any) => upFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-hours"] }),
  });

  if (!pros || !hours) return <div className="text-sm text-foreground/60">Loading…</div>;

  return (
    <div className="space-y-10">
      {pros.map((p: any) => (
        <div key={p.id}>
          <h3 className="font-serif text-2xl">{p.name}</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {WEEKDAYS.map((day, wd) => {
              const row = hours.find((h: any) => h.professional_id === p.id && h.weekday === wd);
              return (
                <HourRow
                  key={wd}
                  label={day}
                  open={row?.open_time?.slice(0, 5) ?? ""}
                  close={row?.close_time?.slice(0, 5) ?? ""}
                  onSave={(o, c) =>
                    mut.mutate({ professional_id: p.id, weekday: wd, open_time: o, close_time: c })
                  }
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function HourRow({
  label,
  open,
  close,
  onSave,
}: {
  label: string;
  open: string;
  close: string;
  onSave: (o: string, c: string) => void;
}) {
  const [o, setO] = useState(open);
  const [c, setC] = useState(close);
  return (
    <div className="flex items-center gap-3 border border-border p-3">
      <span className="w-24 text-sm">{label}</span>
      <input
        type="time"
        value={o}
        onChange={(e) => setO(e.target.value)}
        className="border border-border px-2 py-1 text-sm"
      />
      <span>—</span>
      <input
        type="time"
        value={c}
        onChange={(e) => setC(e.target.value)}
        className="border border-border px-2 py-1 text-sm"
      />
      <button
        onClick={() => onSave(o, c)}
        disabled={!o || !c}
        className="ml-auto text-xs uppercase tracking-wider underline disabled:opacity-30"
      >
        Save
      </button>
    </div>
  );
}

function BlocksTab() {
  const listFn = useServerFn(adminListBlocks);
  const createFn = useServerFn(adminCreateBlock);
  const delFn = useServerFn(adminDeleteBlock);
  const proFn = useServerFn(adminListProfessionals);
  const qc = useQueryClient();
  const { data: blocks } = useQuery({ queryKey: ["admin-blocks"], queryFn: () => listFn() });
  const { data: pros } = useQuery({ queryKey: ["admin-pros"], queryFn: () => proFn() });
  const [pro, setPro] = useState("");
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");
  const [reason, setReason] = useState("");
  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          professional_id: pro || null,
          starts_at: new Date(starts + ":00Z").toISOString(),
          ends_at: new Date(ends + ":00Z").toISOString(),
          reason,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blocks"] });
      setStarts("");
      setEnds("");
      setReason("");
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blocks"] }),
  });

  return (
    <div className="space-y-10">
      <div className="border border-border p-6">
        <div className="eyebrow mb-3">Add time off</div>
        <div className="grid md:grid-cols-4 gap-3">
          <select
            value={pro}
            onChange={(e) => setPro(e.target.value)}
            className="border border-border px-3 py-2 text-sm"
          >
            <option value="">All professionals</option>
            {pros?.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={starts}
            onChange={(e) => setStarts(e.target.value)}
            className="border border-border px-3 py-2 text-sm"
          />
          <input
            type="datetime-local"
            value={ends}
            onChange={(e) => setEnds(e.target.value)}
            className="border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => create.mutate()}
          disabled={!starts || !ends || create.isPending}
          className="btn-primary mt-4 disabled:opacity-50"
        >
          Block time
        </button>
        {create.error && (
          <div className="mt-2 text-sm text-destructive">{(create.error as Error).message}</div>
        )}
      </div>

      <div>
        <div className="eyebrow mb-3">Existing blocks</div>
        {!blocks?.length && <div className="text-sm text-foreground/60">None.</div>}
        <div className="space-y-2">
          {blocks?.map((b: any) => (
            <div key={b.id} className="flex items-center gap-4 border border-border p-3 text-sm">
              <span>
                {fmt(b.starts_at)} → {fmt(b.ends_at)}
              </span>
              <span className="text-foreground/60">{b.professionals?.name ?? "All"}</span>
              {b.reason && <span className="italic text-foreground/60">"{b.reason}"</span>}
              <button
                onClick={() => del.mutate(b.id)}
                className="ml-auto text-xs underline text-destructive"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicesTab() {
  const listFn = useServerFn(adminListServices);
  const upFn = useServerFn(adminUpsertService);
  const delFn = useServerFn(adminDeleteService);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-services"], queryFn: () => listFn() });
  const up = useMutation({
    mutationFn: (v: any) => upFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-services"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-services"] }),
  });
  const [draft, setDraft] = useState({
    slug: "",
    name: "",
    duration_minutes: 60,
    sort_order: 100,
    active: true,
    description: "",
  });

  return (
    <div className="space-y-8">
      <div className="border border-border p-6">
        <div className="eyebrow mb-3">Add service</div>
        <div className="grid md:grid-cols-5 gap-3">
          <input
            placeholder="Slug"
            value={draft.slug}
            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            className="border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="border border-border px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Minutes"
            value={draft.duration_minutes}
            onChange={(e) => setDraft({ ...draft, duration_minutes: Number(e.target.value) })}
            className="border border-border px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Sort"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
            className="border border-border px-3 py-2 text-sm"
          />
          <button onClick={() => up.mutate(draft)} className="btn-primary">
            Add
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {data?.map((s: any) => (
          <ServiceRow
            key={s.id}
            s={s}
            onSave={(v) => up.mutate(v)}
            onDelete={() => del.mutate(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceRow({
  s,
  onSave,
  onDelete,
}: {
  s: any;
  onSave: (v: any) => void;
  onDelete: () => void;
}) {
  const [d, setD] = useState({
    id: s.id,
    slug: s.slug,
    name: s.name,
    description: s.description ?? "",
    duration_minutes: s.duration_minutes,
    sort_order: s.sort_order,
    active: s.active,
  });
  return (
    <div className="grid md:grid-cols-6 gap-2 items-center border border-border p-3 text-sm">
      <input
        value={d.slug}
        onChange={(e) => setD({ ...d, slug: e.target.value })}
        className="border border-border px-2 py-1"
      />
      <input
        value={d.name}
        onChange={(e) => setD({ ...d, name: e.target.value })}
        className="border border-border px-2 py-1"
      />
      <input
        type="number"
        value={d.duration_minutes}
        onChange={(e) => setD({ ...d, duration_minutes: Number(e.target.value) })}
        className="border border-border px-2 py-1"
      />
      <input
        type="number"
        value={d.sort_order}
        onChange={(e) => setD({ ...d, sort_order: Number(e.target.value) })}
        className="border border-border px-2 py-1"
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={d.active}
          onChange={(e) => setD({ ...d, active: e.target.checked })}
        />{" "}
        Active
      </label>
      <div className="flex gap-3 justify-end">
        <button onClick={() => onSave(d)} className="text-xs underline">
          Save
        </button>
        <button onClick={onDelete} className="text-xs underline text-destructive">
          Delete
        </button>
      </div>
    </div>
  );
}

function ProsTab() {
  const listFn = useServerFn(adminListProfessionals);
  const upFn = useServerFn(adminUpsertProfessional);
  const delFn = useServerFn(adminDeleteProfessional);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-pros"], queryFn: () => listFn() });
  const up = useMutation({
    mutationFn: (v: any) => upFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pros"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pros"] }),
  });
  const [draft, setDraft] = useState({ name: "", bio: "", sort_order: 100, active: true });
  return (
    <div className="space-y-8">
      <div className="border border-border p-6">
        <div className="eyebrow mb-3">Add professional</div>
        <div className="grid md:grid-cols-4 gap-3">
          <input
            placeholder="Name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Bio"
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            className="border border-border px-3 py-2 text-sm md:col-span-2"
          />
          <button onClick={() => up.mutate(draft)} className="btn-primary">
            Add
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {data?.map((p: any) => (
          <ProRow key={p.id} p={p} onSave={(v) => up.mutate(v)} onDelete={() => del.mutate(p.id)} />
        ))}
      </div>
    </div>
  );
}

function ProRow({
  p,
  onSave,
  onDelete,
}: {
  p: any;
  onSave: (v: any) => void;
  onDelete: () => void;
}) {
  const [d, setD] = useState({
    id: p.id,
    name: p.name,
    bio: p.bio ?? "",
    sort_order: p.sort_order,
    active: p.active,
  });
  return (
    <div className="grid md:grid-cols-5 gap-2 items-center border border-border p-3 text-sm">
      <input
        value={d.name}
        onChange={(e) => setD({ ...d, name: e.target.value })}
        className="border border-border px-2 py-1"
      />
      <input
        value={d.bio}
        onChange={(e) => setD({ ...d, bio: e.target.value })}
        className="border border-border px-2 py-1 md:col-span-2"
      />
      <input
        type="number"
        value={d.sort_order}
        onChange={(e) => setD({ ...d, sort_order: Number(e.target.value) })}
        className="border border-border px-2 py-1"
      />
      <div className="flex gap-3 justify-end items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={d.active}
            onChange={(e) => setD({ ...d, active: e.target.checked })}
          />{" "}
          Active
        </label>
        <button onClick={() => onSave(d)} className="text-xs underline">
          Save
        </button>
        <button onClick={onDelete} className="text-xs underline text-destructive">
          Del
        </button>
      </div>
    </div>
  );
}
