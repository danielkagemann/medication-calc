import { Fragment, useState, type FormEvent } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, ClipboardList, ListChecks, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const medicationUnits = ["drop", "pill", "ml", "mg"] as const;

type MedicationUnit = (typeof medicationUnits)[number];

type MedicationResult = {
  id: number;
  medicationName: string;
  dailyTotal: number;
  totalRequired: number;
  unit: MedicationUnit;
  startDate: string;
  endDate: string;
  dayCount: number;
  dropsPerMl: number | null;
  totalMlRequired: number | null;
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInclusiveDayCount(startDate: string, endDate: string) {
  if (!startDate || !endDate) return null;

  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const startTimestamp = Date.UTC(startYear, startMonth - 1, startDay);
  const endTimestamp = Date.UTC(endYear, endMonth - 1, endDay);

  if (endTimestamp < startTimestamp) return null;

  return Math.floor((endTimestamp - startTimestamp) / 86_400_000) + 1;
}

function formatQuantity(quantity: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(
    quantity,
  );
}

function formatUnit(quantity: number, unit: MedicationUnit) {
  if (quantity === 1 || unit === "ml" || unit === "mg") return unit;
  return `${unit}s`;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function App() {
  const today = getTodayDate();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [medicationName, setMedicationName] = useState("");
  const [morning, setMorning] = useState("");
  const [midday, setMidday] = useState("");
  const [evening, setEvening] = useState("");
  const [night, setNight] = useState("");
  const [unit, setUnit] = useState<MedicationUnit | "">("");
  const [dropsPerMl, setDropsPerMl] = useState("");
  const [formError, setFormError] = useState("");
  const [results, setResults] = useState<MedicationResult[]>([]);
  const [nextResultId, setNextResultId] = useState(1);

  const dayCount = getInclusiveDayCount(startDate, endDate);
  const amountValues = [morning, midday, evening, night];
  const requiresWholeNumbers = unit === "drop";
  const amountValuesAreValid = amountValues.every((value) => {
    const amount = Number(value);
    return (
      value.trim() !== "" &&
      Number.isFinite(amount) &&
      amount >= 0 &&
      (!requiresWholeNumbers || Number.isInteger(amount))
    );
  });
  const parsedDropsPerMl = unit === "drop" ? Number(dropsPerMl) : null;
  const dropsPerMlIsValid =
    unit !== "drop" ||
    (dropsPerMl.trim() !== "" &&
      parsedDropsPerMl !== null &&
      Number.isFinite(parsedDropsPerMl) &&
      parsedDropsPerMl > 0);
  const canAddMedication = Boolean(
    medicationName.trim() &&
      unit &&
      dayCount !== null &&
      amountValuesAreValid &&
      dropsPerMlIsValid,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (dayCount === null) {
      setFormError("End date must be on or after the start date.");
      return;
    }

    if (!medicationName.trim() || !unit) {
      setFormError("Enter a medication name and select a unit.");
      return;
    }

    const amounts = amountValues.map(Number);
    if (!amountValuesAreValid) {
      setFormError(
        requiresWholeNumbers
          ? "Use whole numbers for drops. Enter 0 for unused times."
          : "Enter a valid amount of 0 or more for all four daily time slots.",
      );
      return;
    }

    if (!dropsPerMlIsValid) {
      setFormError(
        "Enter the drops-per-mL ratio from the product instructions.",
      );
      return;
    }

    const dailyTotal = amounts.reduce((total, amount) => total + amount, 0);
    setResults((currentResults) => [
      {
        id: nextResultId,
        medicationName: medicationName.trim(),
        dailyTotal,
        totalRequired: dailyTotal * dayCount,
        unit,
        startDate,
        endDate,
        dayCount,
        dropsPerMl: parsedDropsPerMl,
        totalMlRequired:
          parsedDropsPerMl === null
            ? null
            : (dailyTotal * dayCount) / parsedDropsPerMl,
      },
      ...currentResults,
    ]);
    setNextResultId((id) => id + 1);
    setMedicationName("");
    setMorning("");
    setMidday("");
    setEvening("");
    setNight("");
    setUnit("");
    setDropsPerMl("");
    setFormError("");
  }

  return (
    <main className="min-h-screen bg-white text-[#1e3029]">
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <aside className="relative isolate h-[320px] overflow-hidden bg-[#dce9e4] sm:h-[380px] lg:sticky lg:top-0 lg:h-screen lg:min-h-[680px]">
          <img
            alt="Blister packs of tablets and capsules"
            className="absolute inset-0 z-0 size-full object-cover object-center"
            src={`${import.meta.env.BASE_URL}medication-context.jpg`}
          />
          <div
            aria-live="polite"
            className="absolute right-4 top-4 z-20 rounded-full bg-[#1f5b4b] px-4 py-2 text-sm font-semibold tabular-nums text-white ring-1 ring-white/80 shadow-[0_0_12px_rgba(255,255,255,0.75)] sm:right-6 sm:top-6"
          >
            <p>
              {dayCount === null
                ? "Check dates"
                : `${dayCount} ${dayCount === 1 ? "day" : "days"}`}
            </p>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-black/45"
          />
          <header className="absolute inset-x-0 bottom-0 z-20 px-5 py-6 sm:px-8 sm:py-8">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                Medication planning
              </p>
              <h1 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] sm:text-5xl">
                Medication quantity calculator
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-base">
                Estimate what you will need from your daily amounts and date
                range.
              </p>
            </div>
          </header>
        </aside>

        <div className="min-w-0 px-4 py-7 sm:px-7 sm:py-9 xl:px-12">
          <div className="mx-auto max-w-2xl">
            <section aria-labelledby="date-range-title" className="mb-9">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays
                  aria-hidden="true"
                  className="size-5 text-[#1f5b4b]"
                />
                <h2 id="date-range-title" className="text-lg font-semibold">
                  Date range
                </h2>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[#557365]">
                Choose the first and last day to count the full medication
                period.
              </p>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:gap-4">
                <div className="min-w-0 space-y-2">
                  <Label className="sr-only" htmlFor="start-date">
                    Start date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        aria-label={`Choose start date, ${format(parseISO(startDate), "PPP")}`}
                        className="w-full min-w-0 justify-start text-left font-normal"
                        id="start-date"
                        variant="outline"
                      >
                        <CalendarDays aria-hidden="true" className="size-4" />
                        {format(parseISO(startDate), "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-[304px] max-w-[calc(100vw-2rem)] p-0"
                    >
                      <Calendar
                        className="w-full [--cell-size:2.25rem]"
                        mode="single"
                        selected={parseISO(startDate)}
                        onSelect={(date) => {
                          if (date) setStartDate(format(date, "yyyy-MM-dd"));
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="min-w-0 space-y-2">
                  <Label className="sr-only" htmlFor="end-date">
                    End date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        aria-label={`Choose end date, ${format(parseISO(endDate), "PPP")}`}
                        className="w-full min-w-0 justify-start text-left font-normal"
                        id="end-date"
                        variant="outline"
                      >
                        <CalendarDays aria-hidden="true" className="size-4" />
                        {format(parseISO(endDate), "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-[304px] max-w-[calc(100vw-2rem)] p-0"
                    >
                      <Calendar
                        className="w-full [--cell-size:2.25rem]"
                        mode="single"
                        selected={parseISO(endDate)}
                        onSelect={(date) => {
                          if (date) setEndDate(format(date, "yyyy-MM-dd"));
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {startDate && endDate && dayCount === null && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  End date must be on or after the start date.
                </p>
              )}
            </section>

            <section
              aria-labelledby="medication-title"
              className="border-t border-[#d5ded7] pt-7"
            >
              <div className="mb-2 flex items-center gap-2">
                <ClipboardList
                  aria-hidden="true"
                  className="size-5 text-[#1f5b4b]"
                />
                <h2 id="medication-title" className="text-lg font-semibold">
                  Medication details
                </h2>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-[#557365]">
                Enter amounts from morning to night. Use whole numbers for
                drops; pill, mL, and mg amounts may include decimals. For drops,
                add the ratio from the product instructions.
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(10rem,1fr)]">
                  <div className="space-y-2">
                    <Label className="sr-only" htmlFor="medication-name">
                      Medication name
                    </Label>
                    <Input
                      autoComplete="off"
                      id="medication-name"
                      placeholder="Medication name"
                      required
                      value={medicationName}
                      onChange={(event) =>
                        setMedicationName(event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="sr-only" htmlFor="unit">
                      Unit
                    </Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5b4b] focus-visible:ring-offset-2"
                      id="unit"
                      required
                      value={unit}
                      onChange={(event) => {
                        const selectedUnit = event.target.value as
                          | MedicationUnit
                          | "";
                        setUnit(selectedUnit);
                        if (selectedUnit !== "drop") setDropsPerMl("");
                      }}
                    >
                      <option disabled value="">
                        Select unit
                      </option>
                      {medicationUnits.map((medicationUnit) => (
                        <option key={medicationUnit} value={medicationUnit}>
                          {medicationUnit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {unit === "drop" && (
                  <div className="max-w-xs space-y-2">
                    <Label className="sr-only" htmlFor="drops-per-ml">
                      Drops per mL
                    </Label>
                    <Input
                      id="drops-per-ml"
                      inputMode="decimal"
                      min="0.0001"
                      placeholder="Drops per mL (e.g. 20)"
                      required
                      step="any"
                      type="number"
                      value={dropsPerMl}
                      onChange={(event) => setDropsPerMl(event.target.value)}
                    />
                    <p className="text-xs text-[#557365]">
                      Use the ratio listed for this medication or dropper.
                    </p>
                  </div>
                )}

                <fieldset className="space-y-3">
                  <legend className="sr-only">Amount per day</legend>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-x-1 sm:gap-x-3">
                    {[
                      {
                        id: "morning",
                        label: "Morning",
                        placeholder: "AM",
                        value: morning,
                        setValue: setMorning,
                      },
                      {
                        id: "midday",
                        label: "Midday",
                        placeholder: "Noon",
                        value: midday,
                        setValue: setMidday,
                      },
                      {
                        id: "evening",
                        label: "Evening",
                        placeholder: "PM",
                        value: evening,
                        setValue: setEvening,
                      },
                      {
                        id: "night",
                        label: "Night",
                        placeholder: "Night",
                        value: night,
                        setValue: setNight,
                      },
                    ].map((slot, index) => (
                      <Fragment key={slot.id}>
                        <div className="min-w-0 space-y-2">
                          <Label className="sr-only" htmlFor={slot.id}>
                            {slot.label}
                          </Label>
                          <Input
                            className="min-w-0 px-2"
                            id={slot.id}
                            inputMode={unit === "drop" ? "numeric" : "decimal"}
                            min="0"
                            placeholder={slot.placeholder}
                            required
                            step={unit === "drop" ? "1" : "any"}
                            type="number"
                            value={slot.value}
                            onChange={(event) =>
                              slot.setValue(event.target.value)
                            }
                          />
                        </div>
                        {index < 3 && (
                          <span
                            aria-hidden="true"
                            className="mb-2 text-sm text-[#557365]"
                          >
                            -
                          </span>
                        )}
                      </Fragment>
                    ))}
                  </div>
                </fieldset>

                {formError && (
                  <p className="text-sm text-red-700" role="alert">
                    {formError}
                  </p>
                )}

                <div className="flex justify-end border-b border-[#d5ded7] pb-7">
                  <Button
                    className="min-w-36 bg-[#1f5b4b] text-white hover:bg-[#174638]"
                    disabled={!canAddMedication}
                    type="submit"
                  >
                    Add medication
                  </Button>
                </div>
              </form>
            </section>

            <section aria-labelledby="results-title" className="pt-7">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2
                  id="results-title"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <ListChecks
                    aria-hidden="true"
                    className="size-5 text-[#1f5b4b]"
                  />
                  Calculated quantities
                </h2>
                <span className="text-sm text-[#557365]">
                  {results.length}{" "}
                  {results.length === 1 ? "medication" : "medications"}
                </span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[#557365]">
                Review each medication&apos;s daily amount and the total needed
                for the selected dates.
              </p>

              {results.length === 0 ? (
                <p className="border-y border-[#d5ded7] py-7 text-sm text-[#557365]">
                  Your medication calculations will appear here.
                </p>
              ) : (
                <ul className="divide-y divide-[#d5ded7] border-y border-[#d5ded7]">
                  {results.map((result) => (
                    <li
                      className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                      key={result.id}
                    >
                      <div>
                        <h3 className="font-semibold">
                          {result.medicationName}
                        </h3>
                        <p className="mt-1 text-sm text-[#557365]">
                          {formatQuantity(result.dailyTotal)}{" "}
                          {formatUnit(result.dailyTotal, result.unit)} per day
                          {result.unit === "drop" && result.dropsPerMl !== null
                            ? ` (${formatQuantity(result.dailyTotal / result.dropsPerMl)} mL)`
                            : ""}{" "}
                          · {result.dayCount}{" "}
                          {result.dayCount === 1 ? "day" : "days"}
                        </p>
                        <p className="mt-1 text-xs text-[#71877b]">
                          {formatDate(result.startDate)} –{" "}
                          {formatDate(result.endDate)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="sm:text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#557365]">
                            Total required
                          </p>
                          <p className="mt-1 text-2xl font-semibold tabular-nums text-[#1f5b4b]">
                            {formatQuantity(
                              result.totalMlRequired ?? result.totalRequired,
                            )}{" "}
                            <span className="text-base">
                              {result.unit === "drop"
                                ? "mL"
                                : formatUnit(result.totalRequired, result.unit)}
                            </span>
                          </p>
                          {result.unit === "drop" &&
                            result.dropsPerMl !== null && (
                              <p className="mt-1 text-xs text-[#557365]">
                                {formatQuantity(result.totalRequired)} drops at{" "}
                                {formatQuantity(result.dropsPerMl)} drops/mL
                              </p>
                            )}
                        </div>
                        <Button
                          aria-label={`Delete ${result.medicationName}`}
                          className="shrink-0 text-red-700 hover:bg-red-50 hover:text-red-800"
                          onClick={() =>
                            setResults((currentResults) =>
                              currentResults.filter(
                                (item) => item.id !== result.id,
                              ),
                            )
                          }
                          size="icon"
                          title={`Delete ${result.medicationName}`}
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
