import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Pill, ShieldCheck, Syringe } from "lucide-react";
import { useMemo, useState } from "react";

function App() {
  const [weightKg, setWeightKg] = useState(70);
  const [dosePerKg, setDosePerKg] = useState(10);
  const [concentration, setConcentration] = useState(50);
  const [maxDose, setMaxDose] = useState(1000);

  const medicationData = useMemo(() => {
    const totalDoseMg = weightKg * dosePerKg;
    const volumeMl = totalDoseMg / concentration;
    const isSafe = totalDoseMg <= maxDose;

    return {
      totalDoseMg,
      volumeMl,
      isSafe,
      maxDose,
    };
  }, [weightKg, dosePerKg, concentration, maxDose]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Clinical tool</p>
            <h1 className="text-3xl font-bold tracking-tight">Medication Calculator</h1>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-sky-600" />
                Prescription Details
              </CardTitle>
              <CardDescription>Quickly estimate a patient-specific dose and volume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={weightKg}
                    onChange={(event) => setWeightKg(Number(event.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosePerKg">Dose (mg/kg)</Label>
                  <Input
                    id="dosePerKg"
                    type="number"
                    min="0"
                    step="0.1"
                    value={dosePerKg}
                    onChange={(event) => setDosePerKg(Number(event.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concentration">Concentration (mg/mL)</Label>
                  <Input
                    id="concentration"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={concentration}
                    onChange={(event) => setConcentration(Number(event.target.value) || 0.1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDose">Max dose (mg)</Label>
                  <Input
                    id="maxDose"
                    type="number"
                    min="0"
                    step="10"
                    value={maxDose}
                    onChange={(event) => setMaxDose(Number(event.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Pill className="h-4 w-4 text-sky-600" />
                    Dose formula
                  </div>
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                    mg × kg × dose
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-900">
                  {medicationData.totalDoseMg.toFixed(1)} mg total
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Volume required: {medicationData.volumeMl.toFixed(2)} mL
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-900 text-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                <p className="text-sm text-slate-300">Total dose</p>
                <p className="mt-2 text-4xl font-bold text-white">{medicationData.totalDoseMg.toFixed(1)}</p>
                <p className="mt-1 text-sm text-slate-300">mg</p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                <p className="text-sm text-slate-300">Volume to administer</p>
                <p className="mt-2 text-4xl font-bold text-sky-300">{medicationData.volumeMl.toFixed(2)}</p>
                <p className="mt-1 text-sm text-slate-300">mL</p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                <p className="text-sm text-slate-300">Safety check</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${medicationData.isSafe ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                    {medicationData.isSafe ? "Within limit" : "Above max dose"}
                  </span>
                  <span className="text-sm text-slate-300">Max {medicationData.maxDose.toFixed(0)} mg</span>
                </div>
              </div>

              <Button className="w-full bg-sky-500 text-white hover:bg-sky-400">Save calculation</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
