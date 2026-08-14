"use client";

import { useCallback, useRef, useState } from "react";
import type { PredictionResponse, SensitivityResponse } from "@/lib/types";
import { api } from "@/lib/api/client";
import { SectionHeader } from "@/components/ui/section-header";
import {
  ParameterForm,
  buildInput,
  validateValues,
  type FormValues,
} from "@/components/prediction/parameter-form";
import { PredictionResults } from "@/components/prediction/prediction-results";

const defaultValues: FormValues = {
  electrolyte: "Na2SiO3",
  concentration: "0.5",
  currentDensity: "3.0",
  voltage: "180",
  frequency: "1000",
  dutyCycle: "40",
  time: "10",
  temperature: "25",
};

export default function PredictionPage() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "analyzing" | "success">("idle");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityResponse | null>(null);
  const [sensitivityParam, setSensitivityParam] = useState("currentDensity");
  const resultsRef = useRef<HTMLDivElement>(null);

  const loadSensitivity = useCallback(
    async (parameterId: string, input: PredictionResponse["inputs"]) => {
      setSensitivityParam(parameterId);
      const data = await api.sensitivity(parameterId, input);
      setSensitivity(data);
    },
    [],
  );

  const handleRun = async () => {
    const validation = validateValues(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setStatus("analyzing");
    try {
      const input = buildInput(values);
      const data = await api.predict(input);
      setResult(data);
      setStatus("success");
      await loadSensitivity("currentDensity", data.inputs);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } catch {
      setStatus("idle");
    }
  };

  const handleParamChange = async (id: string) => {
    if (!result) return;
    await loadSensitivity(id, result.inputs);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="ML pipeline"
        title="Coating Property Prediction"
        description="Estimate coating performance from processing conditions. Material → process parameters → prediction."
        demoLabel="Mock pipeline"
      />

      <div className="grid items-start gap-5 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <ParameterForm
            values={values}
            onChange={(id, value) => {
              setValues((v) => ({ ...v, [id]: value }));
              setErrors((e) => {
                if (!e[id]) return e;
                const next = { ...e };
                delete next[id];
                return next;
              });
            }}
            onRun={handleRun}
            running={status === "analyzing"}
            errors={errors}
          />
        </div>

        {/* Results */}
        <div ref={resultsRef} className="scroll-mt-20 lg:col-span-3">
          <PredictionResults
            status={status}
            result={result}
            sensitivity={sensitivity}
            sensitivityParam={sensitivityParam}
            onSensitivityParam={handleParamChange}
          />
        </div>
      </div>
    </div>
  );
}
