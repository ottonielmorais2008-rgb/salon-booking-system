import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  listServices,
  listProfessionals,
  getAvailability,
  createBooking,
} from "@/lib/booking.functions";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book an Appointment — Studio Demo" },
      {
        name: "description",
        content:
          "Reserve your visit online. Choose a service, a professional, and a time that suits you.",
      },
      { property: "og:title", content: "Book an Appointment — Studio Demo" },
      { property: "og:description", content: "Reserve your visit at our studio in a few minutes." },
    ],
    links: [{ rel: "canonical", href: "/booking" }],
  }),
  component: BookingPage,
});

type Step = 1 | 2 | 3 | 4 | 5;

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function BookingPage() {
  const svcFn = useServerFn(listServices);
  const proFn = useServerFn(listProfessionals);
  const availFn = useServerFn(getAvailability);
  const createFn = useServerFn(createBooking);

  const services = useQuery({ queryKey: ["services"], queryFn: () => svcFn() });
  const pros = useQuery({ queryKey: ["pros"], queryFn: () => proFn() });

  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [proId, setProId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayISO());
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  const avail = useQuery({
    queryKey: ["avail", serviceId, proId, date],
    queryFn: () => availFn({ data: { serviceId: serviceId!, professionalId: proId, date } }),
    enabled: !!serviceId && step >= 3,
  });

  const submit = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          serviceId: serviceId!,
          professionalId: proId,
          date,
          time: time!,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          notes: form.notes || null,
        },
      }),
    onSuccess: () => setStep(5),
  });

  const service = services.data?.find((s: any) => s.id === serviceId);
  const pro = pros.data?.find((p: any) => p.id === proId);

  return (
    <div className="pt-32 md:pt-40 pb-24 min-h-screen">
      <div className="mx-auto max-w-3xl px-6">
        <div className="eyebrow">Reserve</div>
        <h1 className="mt-4 font-serif text-4xl md:text-6xl leading-[1.05]">Book your visit.</h1>

        {/* Progress */}
        <div className="mt-10 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-foreground/50">
          {["Service", "Professional", "Date & time", "Details", "Done"].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className={step > i ? "text-foreground" : step === i + 1 ? "text-foreground" : ""}
              >
                {String(i + 1).padStart(2, "0")} {label}
              </span>
              {i < 4 && <span>—</span>}
            </div>
          ))}
        </div>

        <div className="mt-12 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-3 animate-fade-up">
              <h2 className="font-serif text-2xl mb-4">Choose a service</h2>
              {services.isLoading && <div className="text-sm text-foreground/60">Loading…</div>}
              {services.data?.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setServiceId(s.id);
                    setStep(2);
                  }}
                  className={`w-full text-left border p-5 flex items-baseline justify-between gap-6 transition-colors ${serviceId === s.id ? "border-foreground" : "border-border hover:border-foreground/50"}`}
                >
                  <div>
                    <div className="font-serif text-xl">{s.name}</div>
                    {s.description && (
                      <div className="mt-1 text-sm text-foreground/60">{s.description}</div>
                    )}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-foreground/60 whitespace-nowrap">
                    {s.duration_minutes} min
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fade-up">
              <h2 className="font-serif text-2xl mb-4">Choose your professional</h2>
              <button
                onClick={() => {
                  setProId(null);
                  setStep(3);
                }}
                className={`w-full text-left border p-5 transition-colors ${proId === null ? "border-foreground" : "border-border hover:border-foreground/50"}`}
              >
                <div className="font-serif text-xl">Any available</div>
                <div className="mt-1 text-sm text-foreground/60">
                  We'll assign the first specialist free at your chosen time.
                </div>
              </button>
              {pros.data?.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProId(p.id);
                    setStep(3);
                  }}
                  className={`w-full text-left border p-5 transition-colors ${proId === p.id ? "border-foreground" : "border-border hover:border-foreground/50"}`}
                >
                  <div className="font-serif text-xl">{p.name}</div>
                  {p.bio && <div className="mt-1 text-sm text-foreground/60">{p.bio}</div>}
                </button>
              ))}
              <button
                onClick={() => setStep(1)}
                className="text-xs uppercase tracking-[0.28em] text-foreground/60 hover:text-foreground pt-4"
              >
                ← Back
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-up">
              <h2 className="font-serif text-2xl mb-4">Pick a date and time</h2>
              <div className="mb-6">
                <label className="eyebrow block mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  min={todayISO()}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime(null);
                  }}
                  className="border border-border px-4 py-3"
                />
              </div>
              <div>
                <label className="eyebrow block mb-3">Available times</label>
                {avail.isLoading && <div className="text-sm text-foreground/60">Loading…</div>}
                {avail.data && avail.data.slots.filter((s) => s.available).length === 0 && (
                  <div className="text-sm text-foreground/60">
                    No availability this day. Please try another date.
                  </div>
                )}
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {avail.data?.slots
                    .filter((s) => s.available)
                    .map((s) => (
                      <button
                        key={s.time}
                        onClick={() => setTime(s.time)}
                        className={`py-3 border text-sm ${time === s.time ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50"}`}
                      >
                        {s.time}
                      </button>
                    ))}
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs uppercase tracking-[0.28em] text-foreground/60 hover:text-foreground"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!time}
                  className="btn-primary disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-up">
              <h2 className="font-serif text-2xl mb-6">Your details</h2>
              <div className="mb-6 p-5 bg-surface text-sm space-y-1">
                <div>
                  <span className="eyebrow mr-2">Service</span>
                  {service?.name}
                </div>
                <div>
                  <span className="eyebrow mr-2">With</span>
                  {pro?.name ?? "First available"}
                </div>
                <div>
                  <span className="eyebrow mr-2">When</span>
                  {date} at {time}
                </div>
              </div>
              <div className="space-y-4">
                {[
                  ["Full name", "name", "text"],
                  ["Phone", "phone", "tel"],
                  ["Email", "email", "email"],
                ].map(([label, key, type]) => (
                  <div key={key as string}>
                    <label className="eyebrow block mb-2">{label}</label>
                    <input
                      type={type as string}
                      required
                      value={(form as any)[key as string]}
                      onChange={(e) => setForm({ ...form, [key as string]: e.target.value })}
                      className="w-full border border-border px-4 py-3 focus:outline-none focus:border-foreground"
                    />
                  </div>
                ))}
                <div>
                  <label className="eyebrow block mb-2">Notes (optional)</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-border px-4 py-3 focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>
              {submit.error && (
                <div className="mt-4 text-sm text-destructive">
                  {(submit.error as Error).message}
                </div>
              )}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="text-xs uppercase tracking-[0.28em] text-foreground/60 hover:text-foreground"
                >
                  ← Back
                </button>
                <button
                  onClick={() => submit.mutate()}
                  disabled={submit.isPending || !form.name || !form.phone || !form.email}
                  className="btn-primary disabled:opacity-40"
                >
                  {submit.isPending ? "Booking…" : "Confirm booking"}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center animate-fade-up py-10">
              <div className="eyebrow">Confirmed</div>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">Thank you.</h2>
              <p className="mt-6 text-foreground/70 max-w-md mx-auto">
                Your appointment is booked. We'll be in touch by phone or email if we need anything.
              </p>
              <div className="mt-6 p-5 bg-surface text-sm inline-block text-left">
                <div>
                  <span className="eyebrow mr-2">Service</span>
                  {service?.name}
                </div>
                <div>
                  <span className="eyebrow mr-2">When</span>
                  {date} at {time}
                </div>
              </div>
              <div className="mt-10">
                <a href="/" className="btn-outline">
                  Return home
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
