"use client";

import { useState } from "react";
import { FormDefinition } from "@/types/forms";

interface FormRendererProps {
  definition: FormDefinition;
  token: string;
}

const buildInitialAssignments = (form: FormDefinition) =>
  Object.fromEntries(form.services.map((service) => [service.id, ""]));

export const FormRenderer = ({ definition, token }: FormRendererProps) => {
  const [assignments, setAssignments] = useState<Record<string, string>>(
    () => buildInitialAssignments(definition),
  );
  const [includeNotes, setIncludeNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAssignmentChange = (serviceId: string, workerId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [serviceId]: workerId,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCompleted) {
      return;
    }

    const missingServices = definition.services.filter(
      (service) => !assignments[service.id],
    );

    if (missingServices.length > 0) {
      setStatus("error");
      setFeedback("يرجى تحديد موظف لكل خدمة قبل الإرسال");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      const response = await fetch(`/api/submit/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignments: definition.services.map((service) => ({
            serviceId: service.id,
            workerId: assignments[service.id],
          })),
          notes: includeNotes ? notes.trim() || undefined : undefined,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "تعذر إرسال الرد");
      }

      setStatus("success");
      setFeedback("");
      setIncludeNotes(false);
      setNotes("");
      setAssignments(buildInitialAssignments(definition));
      setIsCompleted(true);
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof Error
          ? error.message
          : "حدث خطأ غير متوقع، يرجى المحاولة مجدداً",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-100"
    >
      <header className="mb-8 space-y-2">
        <p className="text-sm text-slate-500">
          معرف النموذج: <span className="font-semibold">{definition.formId}</span>
        </p>
        <h1 className="text-3xl font-bold text-slate-900">{definition.title}</h1>
        <p className="text-base text-slate-600 whitespace-pre-line">
          {definition.description}
        </p>
      </header>

      <div className="space-y-6">
        {isCompleted ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-8 text-center text-emerald-800">
            <p className="text-2xl font-bold">تم إرسال الرد بنجاح ✅</p>
            <p className="mt-3 text-base">
              تمت مشاركة التخصيصات مع المسؤول، ولم يعد بالإمكان إرسال النموذج مرة
              أخرى من هذه الصفحة.
            </p>
          </div>
        ) : (
          <>
            <section className="space-y-5">
              {definition.services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-3xl border border-slate-100 bg-slate-50/60 p-5 shadow-sm"
                >
                  <div className="text-lg font-semibold text-slate-900">
                    {service.name}
                  </div>
                  <div className="mt-4 space-y-3">
                    {definition.workers.map((worker) => {
                      const isChecked = assignments[service.id] === worker.id;
                      return (
                        <label
                          key={`${service.id}-${worker.id}`}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 text-slate-900 transition ${
                            isChecked
                              ? "border-cyan-500 bg-white"
                              : "border-transparent bg-white/70 hover:border-cyan-200"
                          }`}
                        >
                          <span className="text-base font-medium">
                            {worker.name}
                          </span>
                          <input
                            type="radio"
                            className="h-4 w-4 border-slate-400 accent-cyan-500"
                            name={`service-${service.id}`}
                            value={worker.id}
                            checked={isChecked}
                            onChange={() =>
                              handleAssignmentChange(service.id, worker.id)
                            }
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            <div className="rounded-2xl border border-slate-200 p-4">
              <label className="flex items-center gap-3 text-lg font-semibold text-slate-800">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-cyan-600"
                  checked={includeNotes}
                  onChange={(event) => setIncludeNotes(event.target.checked)}
                />
                إضافة ملاحظات
              </label>
              {includeNotes && (
                <textarea
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-right text-base text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  rows={4}
                  placeholder="اكتب تفاصيل إضافية أو ملاحظة للمسؤول..."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-cyan-600 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "جاري الإرسال..." : "إرسال الرد"}
            </button>
          </>
        )}

        {feedback && (
          <p
            className={`text-base ${
              status === "success" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {feedback}
          </p>
        )}
      </div>
    </form>
  );
};

