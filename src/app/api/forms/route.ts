import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FormDefinition } from "@/types/forms";
import { createShortId } from "@/lib/short-id";

const workerSchema = z.object({
  id: z.string().min(1, "مطلوب معرّف الموظف"),
  name: z.string().min(1, "مطلوب اسم الموظف"),
});

const serviceSchema = z.object({
  id: z.string().min(1, "مطلوب معرّف الخدمة"),
  name: z.string().min(1, "مطلوب اسم الخدمة"),
});

const createFormSchema = z.object({
  title: z.string().min(1, "عنوان النموذج مطلوب"),
  description: z
    .string()
    .min(1, "الوصف مطلوب")
    .max(800, "الوصف طويل جداً"),
  workers: z
    .array(workerSchema)
    .min(1, "يجب إضافة موظف واحد على الأقل للاختيار"),
  services: z
    .array(serviceSchema)
    .min(1, "يجب إضافة خدمة واحدة على الأقل"),
  callbackUrl: z.string().url("رابط الاستقبال غير صالح"),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const data = createFormSchema.parse(payload);

    const definition: FormDefinition = {
      ...data,
      formId: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    const shortId = createShortId(definition);
    const origin = request.nextUrl.origin;

    return NextResponse.json({
      formUrl: `${origin}/form/${shortId}`,
      formId: definition.formId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "تعذر إنشاء النموذج بسبب خطأ في البيانات",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Unexpected error while creating form", error);
    return NextResponse.json(
      { message: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً" },
      { status: 500 },
    );
  }
}

