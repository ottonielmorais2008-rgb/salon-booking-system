import { describe, expect, it } from "vitest";
import {
  addMinutesISO,
  assertBookableStart,
  availabilitySchema,
  bookingOccupiesSlot,
  bookingStatusSchema,
  bookingWindow,
  bookingsThatOccupy,
  buildBookingRecord,
  cancelBooking,
  candidateSlotTimes,
  confirmBooking,
  createBookingSchema,
  dayBounds,
  evaluateSlots,
  interpretBookingInsertError,
  intervalConflicts,
  overlaps,
  pickProfessional,
  wallClockISO,
  weekdayFromDate,
  type BookingStatus,
  type ScheduleBooking,
  type TimeInterval,
  type WorkingHourWindow,
} from "./booking-rules";

const SERVICE_ID = "11111111-1111-4111-8111-111111111111";
const PRO_A = "22222222-2222-4222-8222-222222222222";
const PRO_B = "33333333-3333-4333-8333-333333333333";
const NOW = Date.parse("2026-10-24T12:00:00.000Z");
const FUTURE = "2099-06-15";

function hours(professionalId: string, openTime: string, closeTime: string): WorkingHourWindow {
  return { professional_id: professionalId, open_time: openTime, close_time: closeTime };
}

function booking(
  professionalId: string,
  start: string,
  end: string,
  status: BookingStatus = "pending",
): ScheduleBooking & { status: BookingStatus } {
  return {
    professional_id: professionalId,
    starts_at: start,
    ends_at: end,
    status,
  };
}

function block(professionalId: string | null, start: string, end: string): TimeInterval {
  return { professional_id: professionalId, starts_at: start, ends_at: end };
}

function validCustomer(overrides: Record<string, unknown> = {}) {
  return {
    serviceId: SERVICE_ID,
    professionalId: PRO_A,
    date: FUTURE,
    time: "10:00",
    customerName: "Ana Silva",
    customerPhone: "912345678",
    customerEmail: "ana@example.com",
    notes: "Corte com franja",
    ...overrides,
  };
}

describe("criação de marcação", () => {
  it("grava uma marcação pending no intervalo calculado para o profissional escolhido", () => {
    const input = createBookingSchema.parse(validCustomer());
    const { starts_at, ends_at } = bookingWindow(input.date, input.time, 60);
    assertBookableStart(starts_at, NOW);

    const record = buildBookingRecord({
      serviceId: input.serviceId,
      professionalId: input.professionalId!,
      starts_at,
      ends_at,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      notes: input.notes,
    });

    expect(record).toEqual({
      service_id: SERVICE_ID,
      professional_id: PRO_A,
      starts_at: "2099-06-15T10:00:00.000Z",
      ends_at: "2099-06-15T11:00:00.000Z",
      status: "pending",
      customer_name: "Ana Silva",
      customer_phone: "912345678",
      customer_email: "ana@example.com",
      notes: "Corte com franja",
    });
  });

  it("normaliza espaços nos dados do cliente antes de aceitar a marcação", () => {
    const parsed = createBookingSchema.parse(
      validCustomer({
        customerName: "  Ana Silva  ",
        customerPhone: "  912345678  ",
        customerEmail: "  ana@example.com  ",
        notes: "  sem pressa  ",
      }),
    );

    expect(parsed.customerName).toBe("Ana Silva");
    expect(parsed.customerPhone).toBe("912345678");
    expect(parsed.customerEmail).toBe("ana@example.com");
    expect(parsed.notes).toBe("sem pressa");
  });

  it("trata notas omissas ou nulas como ausência de notas na linha a inserir", () => {
    const omitted = createBookingSchema.parse(validCustomer({ notes: undefined }));
    const explicitNull = createBookingSchema.parse(validCustomer({ notes: null }));

    expect(omitted.notes).toBeUndefined();
    expect(
      buildBookingRecord({
        serviceId: SERVICE_ID,
        professionalId: PRO_A,
        starts_at: "2099-06-15T10:00:00.000Z",
        ends_at: "2099-06-15T11:00:00.000Z",
        customerName: omitted.customerName,
        customerPhone: omitted.customerPhone,
        customerEmail: omitted.customerEmail,
        notes: omitted.notes,
      }).notes,
    ).toBeNull();
    expect(explicitNull.notes).toBeNull();
  });

  it("escolhe o primeiro profissional livre quando o cliente não tem preferência", () => {
    const chosen = pickProfessional({
      time: "14:00",
      durationMinutes: 60,
      workingHours: [hours(PRO_A, "09:00", "18:00"), hours(PRO_B, "09:00", "18:00")],
      blocks: [],
      bookings: [booking(PRO_A, wallClockISO(FUTURE, "14:00"), wallClockISO(FUTURE, "15:00"))],
    });

    expect(chosen).toBe(PRO_B);
  });

  it("mantém a ordem dos horários e não salta para um profissional mais à frente se o primeiro estiver livre", () => {
    const chosen = pickProfessional({
      time: "14:00",
      durationMinutes: 60,
      workingHours: [hours(PRO_B, "09:00", "18:00"), hours(PRO_A, "09:00", "18:00")],
      blocks: [],
      bookings: [],
    });

    expect(chosen).toBe(PRO_B);
  });

  it("recusa a marcação quando nenhum profissional cobre o horário", () => {
    expect(() =>
      pickProfessional({
        time: "20:00",
        durationMinutes: 60,
        workingHours: [hours(PRO_A, "09:00", "18:00")],
        blocks: [],
        bookings: [],
      }),
    ).toThrow("No professional available at that time");
  });

  it("recusa a marcação quando todos os profissionais elegíveis estão ocupados ou bloqueados", () => {
    expect(() =>
      pickProfessional({
        time: "14:00",
        durationMinutes: 60,
        workingHours: [hours(PRO_A, "09:00", "18:00"), hours(PRO_B, "09:00", "18:00")],
        blocks: [block(PRO_B, wallClockISO(FUTURE, "14:00"), wallClockISO(FUTURE, "16:00"))],
        bookings: [booking(PRO_A, wallClockISO(FUTURE, "14:00"), wallClockISO(FUTURE, "15:00"))],
      }),
    ).toThrow("No professional available at that time");
  });

  it("traduz a violação de exclusão da base de dados para a mensagem de horário ocupado", () => {
    expect(
      interpretBookingInsertError({
        message: 'conflicting key value violates exclusion constraint "no_overlap_per_pro"',
        code: "23P01",
      }).message,
    ).toBe("This time slot was just taken. Please pick another.");

    expect(
      interpretBookingInsertError({
        message: "NO_OVERLAP detected",
        code: "23505",
      }).message,
    ).toBe("This time slot was just taken. Please pick another.");
  });

  it("preserva a mensagem original quando a inserção falha por outro motivo", () => {
    expect(
      interpretBookingInsertError({ message: "permission denied", code: "42501" }).message,
    ).toBe("permission denied");
    expect(interpretBookingInsertError({ message: "" }).message).toBe("");
  });
});

describe("validação de datas e horas", () => {
  it("aceita uma data civil e uma hora com dois dígitos", () => {
    const parsed = availabilitySchema.parse({
      serviceId: SERVICE_ID,
      professionalId: null,
      date: "2026-10-24",
    });
    const bookingInput = createBookingSchema.parse(validCustomer({ time: "09:30" }));

    expect(parsed.date).toBe("2026-10-24");
    expect(parsed.professionalId).toBeNull();
    expect(bookingInput.time).toBe("09:30");
  });

  it.each(["24-10-2026", "2026/10/24", "2026-10-2", "20261024", "", "2026-10-24T10:00"])(
    "rejeita a data inválida %j",
    (date) => {
      expect(createBookingSchema.safeParse(validCustomer({ date })).success).toBe(false);
      expect(
        availabilitySchema.safeParse({
          serviceId: SERVICE_ID,
          professionalId: null,
          date,
        }).success,
      ).toBe(false);
    },
  );

  it.each(["9:00", "09:00:00", "0900", "9:00am", "", "10-00"])(
    "rejeita a hora inválida %j",
    (time) => {
      expect(createBookingSchema.safeParse(validCustomer({ time })).success).toBe(false);
    },
  );

  it("recusa o passado e permite o instante exacto de agora", () => {
    const startsAt = wallClockISO("2026-10-24", "12:00");
    expect(() => assertBookableStart(wallClockISO("2026-10-24", "11:59"), NOW)).toThrow(
      "Cannot book in the past",
    );
    expect(() => assertBookableStart(startsAt, NOW)).not.toThrow();
    expect(() => assertBookableStart(wallClockISO("2026-10-24", "12:01"), NOW)).not.toThrow();
  });

  it("calcula o dia da semana em UTC ao meio-dia, para não depender do fuso da máquina", () => {
    expect(weekdayFromDate("2026-10-24")).toBe(6);
    expect(weekdayFromDate("2026-10-25")).toBe(0);
    expect(weekdayFromDate("2026-10-26")).toBe(1);
  });

  it("limita a leitura do dia ao relógio de parede entre 00:00 e 23:59", () => {
    expect(dayBounds("2026-10-24")).toEqual({
      dayStart: "2026-10-24T00:00:00.000Z",
      dayEnd: "2026-10-24T23:59:00.000Z",
    });
  });

  it("soma minutos em UTC e atravessa a meia-noite", () => {
    expect(addMinutesISO("2026-10-24T23:30:00.000Z", 60)).toBe("2026-10-25T00:30:00.000Z");
    expect(bookingWindow("2026-10-24", "23:30", 60)).toEqual({
      starts_at: "2026-10-24T23:30:00.000Z",
      ends_at: "2026-10-25T00:30:00.000Z",
    });
  });
});

describe("conflitos e sobreposição de horários", () => {
  const ten = wallClockISO(FUTURE, "10:00");
  const eleven = wallClockISO(FUTURE, "11:00");
  const twelve = wallClockISO(FUTURE, "12:00");
  const tenThirty = wallClockISO(FUTURE, "10:30");

  it("não trata intervalos que apenas se tocam como conflito", () => {
    expect(overlaps(ten, eleven, eleven, twelve)).toBe(false);
    expect(overlaps(eleven, twelve, ten, eleven)).toBe(false);
  });

  it("detecta sobreposição parcial, inclusão e o mesmo intervalo", () => {
    expect(overlaps(ten, tenThirty, wallClockISO(FUTURE, "10:15"), eleven)).toBe(true);
    expect(overlaps(ten, twelve, tenThirty, eleven)).toBe(true);
    expect(overlaps(ten, eleven, ten, eleven)).toBe(true);
    expect(overlaps(tenThirty, eleven, ten, twelve)).toBe(true);
  });

  it("ignora um intervalo de duração zero", () => {
    expect(overlaps(ten, ten, ten, eleven)).toBe(false);
    expect(overlaps(ten, eleven, ten, ten)).toBe(false);
  });

  it("bloqueia o profissional da marcação e deixa outro profissional livre", () => {
    const start = wallClockISO(FUTURE, "14:00");
    const end = wallClockISO(FUTURE, "15:00");
    const existing = [booking(PRO_A, start, end, "confirmed")];

    expect(intervalConflicts(start, end, PRO_A, [], existing)).toBe(true);
    expect(intervalConflicts(start, end, PRO_B, [], existing)).toBe(false);
    expect(
      intervalConflicts(
        wallClockISO(FUTURE, "15:00"),
        wallClockISO(FUTURE, "16:00"),
        PRO_A,
        [],
        existing,
      ),
    ).toBe(false);
    expect(
      intervalConflicts(
        wallClockISO(FUTURE, "13:30"),
        wallClockISO(FUTURE, "14:30"),
        PRO_A,
        [],
        existing,
      ),
    ).toBe(true);
  });

  it("aplica um bloqueio de todo o salão a qualquer profissional", () => {
    const start = wallClockISO(FUTURE, "14:00");
    const end = wallClockISO(FUTURE, "15:00");
    const blocks = [block(null, start, wallClockISO(FUTURE, "16:00"))];

    expect(intervalConflicts(start, end, PRO_A, blocks, [])).toBe(true);
    expect(intervalConflicts(start, end, PRO_B, blocks, [])).toBe(true);
  });

  it("não deixa um bloqueio individual fechar a agenda dos restantes", () => {
    const start = wallClockISO(FUTURE, "14:00");
    const end = wallClockISO(FUTURE, "15:00");
    const blocks = [block(PRO_A, start, end)];

    expect(intervalConflicts(start, end, PRO_A, blocks, [])).toBe(true);
    expect(intervalConflicts(start, end, PRO_B, blocks, [])).toBe(false);
  });

  it("marca a vaga como livre quando pelo menos um profissional a consegue fazer", () => {
    const slots = evaluateSlots({
      date: FUTURE,
      durationMinutes: 60,
      professionalId: null,
      workingHours: [hours(PRO_A, "14:00", "16:00"), hours(PRO_B, "14:00", "16:00")],
      blocks: [],
      bookings: [booking(PRO_A, wallClockISO(FUTURE, "14:00"), wallClockISO(FUTURE, "15:00"))],
      nowMs: NOW,
    });

    expect(slots.find((slot) => slot.time === "14:00")).toEqual({ time: "14:00", available: true });
    expect(slots.find((slot) => slot.time === "15:00")).toEqual({ time: "15:00", available: true });
  });

  it("fecha a vaga quando o profissional pedido está ocupado, mesmo que outro esteja livre", () => {
    const slots = evaluateSlots({
      date: FUTURE,
      durationMinutes: 60,
      professionalId: PRO_A,
      workingHours: [hours(PRO_A, "14:00", "16:00"), hours(PRO_B, "14:00", "16:00")],
      blocks: [],
      bookings: [booking(PRO_A, wallClockISO(FUTURE, "14:00"), wallClockISO(FUTURE, "15:00"))],
      nowMs: NOW,
    });

    expect(slots.find((slot) => slot.time === "14:00")?.available).toBe(false);
    expect(slots.find((slot) => slot.time === "15:00")?.available).toBe(true);
  });

  it("mantém na lista as vagas passadas, mas indisponíveis", () => {
    const slots = evaluateSlots({
      date: "2026-10-24",
      durationMinutes: 30,
      professionalId: null,
      workingHours: [hours(PRO_A, "11:00", "13:00")],
      blocks: [],
      bookings: [],
      nowMs: NOW,
    });

    expect(slots).toEqual([
      { time: "11:00", available: false },
      { time: "11:30", available: false },
      { time: "12:00", available: true },
      { time: "12:30", available: true },
    ]);
  });
});

describe("cancelamento", () => {
  const start = wallClockISO(FUTURE, "14:00");
  const end = wallClockISO(FUTURE, "15:00");

  it("aceita apenas pending, confirmed e cancelled", () => {
    expect(bookingStatusSchema.parse("pending")).toBe("pending");
    expect(bookingStatusSchema.parse("confirmed")).toBe("confirmed");
    expect(bookingStatusSchema.parse("cancelled")).toBe("cancelled");
    expect(bookingStatusSchema.safeParse("Canceled").success).toBe(false);
    expect(bookingStatusSchema.safeParse("CANCELLED").success).toBe(false);
    expect(bookingStatusSchema.safeParse("").success).toBe(false);
    expect(bookingStatusSchema.safeParse("done").success).toBe(false);
  });

  it("tira a marcação da agenda ao cancelar e mantém-na ao confirmar", () => {
    const pending = booking(PRO_A, start, end, "pending");
    const cancelled = cancelBooking({ ...pending, status: "pending" as const });
    const confirmed = confirmBooking({ ...pending, status: "pending" as const });

    expect(cancelled.status).toBe("cancelled");
    expect(bookingOccupiesSlot(cancelled.status)).toBe(false);
    expect(bookingOccupiesSlot(confirmed.status)).toBe(true);
    expect(bookingsThatOccupy([pending, cancelled, confirmed])).toEqual([pending, confirmed]);
  });

  it("liberta a vaga quando a única marcação que a ocupava é cancelada", () => {
    const occupied = [booking(PRO_A, start, end, "pending")];
    const freed = occupied.map((row) => cancelBooking({ ...row, status: "pending" as const }));

    const before = evaluateSlots({
      date: FUTURE,
      durationMinutes: 60,
      professionalId: PRO_A,
      workingHours: [hours(PRO_A, "09:00", "18:00")],
      blocks: [],
      bookings: occupied,
      nowMs: NOW,
    });
    const after = evaluateSlots({
      date: FUTURE,
      durationMinutes: 60,
      professionalId: PRO_A,
      workingHours: [hours(PRO_A, "09:00", "18:00")],
      blocks: [],
      bookings: freed,
      nowMs: NOW,
    });

    expect(before.find((slot) => slot.time === "14:00")?.available).toBe(false);
    expect(before.find((slot) => slot.time === "13:30")?.available).toBe(false);
    expect(after.find((slot) => slot.time === "14:00")?.available).toBe(true);
    expect(after.find((slot) => slot.time === "13:30")?.available).toBe(true);
  });

  it("continua a bloquear a vaga se outra marcação activa se sobrepuser à cancelada", () => {
    const rows = [
      cancelBooking(booking(PRO_A, start, end, "confirmed")),
      booking(PRO_A, wallClockISO(FUTURE, "14:30"), wallClockISO(FUTURE, "15:30"), "pending"),
    ];

    expect(intervalConflicts(start, end, PRO_A, [], rows)).toBe(true);
  });

  it("volta a atribuir o profissional quando a marcação desse intervalo foi cancelada", () => {
    const chosen = pickProfessional({
      time: "14:00",
      durationMinutes: 60,
      workingHours: [hours(PRO_A, "09:00", "18:00"), hours(PRO_B, "09:00", "18:00")],
      blocks: [],
      bookings: [
        cancelBooking(booking(PRO_A, start, end, "confirmed")),
        booking(PRO_B, start, end, "pending"),
      ],
    });

    expect(chosen).toBe(PRO_A);
  });
});

describe("casos limite e entradas inválidas", () => {
  it("rejeita nome, telefone, email, identificadores e notas fora dos limites", () => {
    expect(createBookingSchema.safeParse(validCustomer({ customerName: "A" })).success).toBe(false);
    expect(createBookingSchema.safeParse(validCustomer({ customerName: "  A  " })).success).toBe(
      false,
    );
    expect(createBookingSchema.safeParse(validCustomer({ customerName: "Ana" })).success).toBe(
      true,
    );
    expect(
      createBookingSchema.safeParse(validCustomer({ customerName: "A".repeat(100) })).success,
    ).toBe(true);
    expect(
      createBookingSchema.safeParse(validCustomer({ customerName: "A".repeat(101) })).success,
    ).toBe(false);

    expect(createBookingSchema.safeParse(validCustomer({ customerPhone: "12345" })).success).toBe(
      false,
    );
    expect(
      createBookingSchema.safeParse(validCustomer({ customerPhone: "  12345  " })).success,
    ).toBe(false);
    expect(createBookingSchema.safeParse(validCustomer({ customerPhone: "123456" })).success).toBe(
      true,
    );
    expect(
      createBookingSchema.safeParse(validCustomer({ customerPhone: "1".repeat(30) })).success,
    ).toBe(true);
    expect(
      createBookingSchema.safeParse(validCustomer({ customerPhone: "1".repeat(31) })).success,
    ).toBe(false);

    expect(createBookingSchema.safeParse(validCustomer({ customerEmail: "ana" })).success).toBe(
      false,
    );
    expect(createBookingSchema.safeParse(validCustomer({ customerEmail: "ana@" })).success).toBe(
      false,
    );
    expect(
      createBookingSchema.safeParse(
        validCustomer({ customerEmail: `${"a".repeat(190)}@example.com` }),
      ).success,
    ).toBe(false);

    expect(createBookingSchema.safeParse(validCustomer({ serviceId: "svc-1" })).success).toBe(
      false,
    );
    expect(createBookingSchema.safeParse(validCustomer({ professionalId: "pro-a" })).success).toBe(
      false,
    );
    expect(createBookingSchema.safeParse(validCustomer({ professionalId: null })).success).toBe(
      true,
    );

    expect(createBookingSchema.safeParse(validCustomer({ notes: "n".repeat(500) })).success).toBe(
      true,
    );
    expect(createBookingSchema.safeParse(validCustomer({ notes: "n".repeat(501) })).success).toBe(
      false,
    );
    expect(createBookingSchema.safeParse(validCustomer({ notes: "" })).success).toBe(true);
  });

  it("gera vagas de 30 minutos e inclui o serviço que termina exactamente no fecho", () => {
    expect(candidateSlotTimes([hours(PRO_A, "09:00", "11:00")], 60)).toEqual([
      "09:00",
      "09:30",
      "10:00",
    ]);
    expect(candidateSlotTimes([hours(PRO_A, "09:00", "10:00")], 60)).toEqual(["09:00"]);
  });

  it("não oferece um serviço que ultrapassa a hora de fecho", () => {
    expect(candidateSlotTimes([hours(PRO_A, "09:00", "10:00")], 61)).toEqual([]);
    expect(candidateSlotTimes([hours(PRO_A, "09:00", "09:30")], 60)).toEqual([]);
  });

  it("lê horários vindos da base de dados no formato HH:MM:SS", () => {
    expect(candidateSlotTimes([hours(PRO_A, "09:00:00", "11:00:00")], 60)).toEqual([
      "09:00",
      "09:30",
      "10:00",
    ]);
  });

  it("preserva um horário de abertura que não cai na grelha da hora certa", () => {
    expect(candidateSlotTimes([hours(PRO_A, "09:10", "11:10")], 30)).toEqual([
      "09:10",
      "09:40",
      "10:10",
      "10:40",
    ]);
  });

  it("junta vagas repetidas de vários profissionais e ordena-as", () => {
    expect(
      candidateSlotTimes([hours(PRO_B, "15:00", "16:30"), hours(PRO_A, "09:00", "10:00")], 60),
    ).toEqual(["09:00", "15:00", "15:30"]);
  });

  it("não gera vagas quando o fecho é anterior à abertura ou a hora não é numérica", () => {
    expect(candidateSlotTimes([hours(PRO_A, "18:00", "09:00")], 30)).toEqual([]);
    expect(candidateSlotTimes([hours(PRO_A, "aa:bb", "18:00")], 30)).toEqual([]);
    expect(candidateSlotTimes([], 60)).toEqual([]);
  });

  it("não marca como passado um instante que a linguagem não consegue ler", () => {
    expect(() => assertBookableStart("2026-10-24T99:99:00.000Z", NOW)).not.toThrow();
  });

  it("aceita 24:00 no formato e trata essa hora como a meia-noite seguinte", () => {
    expect(createBookingSchema.safeParse(validCustomer({ time: "24:00" })).success).toBe(true);
    expect(bookingWindow("2026-10-24", "24:00", 30)).toEqual({
      starts_at: "2026-10-24T24:00:00.000Z",
      ends_at: "2026-10-25T00:30:00.000Z",
    });
  });

  it("trata uma marcação sem estado como ocupada e uma cancelada como livre", () => {
    const withoutStatus: ScheduleBooking = {
      professional_id: PRO_A,
      starts_at: wallClockISO(FUTURE, "10:00"),
      ends_at: wallClockISO(FUTURE, "11:00"),
    };
    expect(bookingsThatOccupy([withoutStatus])).toEqual([withoutStatus]);
    expect(bookingsThatOccupy([{ ...withoutStatus, status: "cancelled" }])).toEqual([]);
  });
});
