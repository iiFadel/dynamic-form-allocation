import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { decodeFormToken } from "@/lib/form-token";

const assignmentSchema = z.object({
  serviceId: z.string().min(1, "مطلوب اختيار خدمة"),
  workerId: z.string().min(1, "يرجى اختيار موظف"),
});

const submissionSchema = z.object({
  assignments: z
    .array(assignmentSchema)
    .min(1, "يجب اختيار موظف لكل خدمة"),
  notes: z.string().optional(),
});

type Params =
  | { token?: string | string[] }
  | Promise<{ token?: string | string[] }>;

export async function POST(
  request: NextRequest,
  context: { params: Params },
) {
  const resolvedParams = await context.params;
  const tokenParam = Array.isArray(resolvedParams?.token)
    ? resolvedParams?.token[0]
    : resolvedParams?.token;

  const definition = decodeFormToken(tokenParam);

  if (!definition) {
    return NextResponse.json(
      { message: "رابط النموذج غير صالح أو منتهي" },
      { status: 404 },
    );
  }

  try {
    if (!tokenParam) {
      return NextResponse.json(
        { message: "رابط النموذج غير صالح أو منتهي" },
        { status: 404 },
      );
    }

    const payload = await request.json();
    const data = submissionSchema.parse(payload);

    if (data.assignments.length !== definition.services.length) {
      return NextResponse.json(
        { message: "يجب إسناد موظف لكل خدمة في النموذج" },
        { status: 400 },
      );
    }

    const detailedAssignments: {
      service: (typeof definition.services)[number];
      worker: (typeof definition.workers)[number];
    }[] = [];
    const seenServices = new Set<string>();

    for (const assignment of data.assignments) {
      if (seenServices.has(assignment.serviceId)) {
        return NextResponse.json(
          { message: "تم تكرار إحدى الخدمات أثناء الإسناد" },
          { status: 400 },
        );
      }
      seenServices.add(assignment.serviceId);

      const service = definition.services.find(
        (s) => s.id === assignment.serviceId,
      );
      const worker = definition.workers.find(
        (w) => w.id === assignment.workerId,
      );

      if (!service || !worker) {
        return NextResponse.json(
          { message: "تعذر مطابقة الخدمة أو الموظف المحدد" },
          { status: 400 },
        );
      }

      detailedAssignments.push({
        service,
        worker,
      });
    }

    const callbackPayload = {
      formId: definition.formId,
      formTitle: definition.title,
      assignments: detailedAssignments,
      notes: data.notes?.trim() || null,
      submittedAt: new Date().toISOString(),
    };

    const callbackResponse = await fetch(definition.callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callbackPayload),
      cache: "no-store",
    });

    if (!callbackResponse.ok) {
      console.error("Callback failed", await callbackResponse.text());
      return NextResponse.json(
        { message: "فشل إرسال البيانات إلى العنوان المحدد" },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: "تم استلام الرد وإرساله بنجاح" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "تعذر اعتماد المدخلات",
          issues: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Submission error", error);
    return NextResponse.json(
      { message: "حدث خطأ غير متوقع" },
      { status: 500 },
    );
  }
}

