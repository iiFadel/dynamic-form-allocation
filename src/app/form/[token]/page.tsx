import { FormRenderer } from "@/components/form-renderer";
import { decodeFormToken } from "@/lib/form-token";

const InvalidFormState = () => (
  <div className="w-full max-w-lg rounded-3xl bg-white/90 p-8 text-center shadow-xl ring-1 ring-rose-100">
    <h1 className="text-2xl font-bold text-rose-600">الرابط غير صالح</h1>
    <p className="mt-4 text-lg text-slate-600">
      تأكد من استخدام الرابط الأحدث الذي تم توليده عبر خدمة webhook، أو اطلب من
      المسؤول إعادة إنشاء النموذج.
    </p>
  </div>
);

type Params =
  | { token?: string | string[] }
  | Promise<{ token?: string | string[] }>;

export default async function DynamicFormPage({ params }: { params: Params }) {
  const resolvedParams = await params;
  const tokenParam = Array.isArray(resolvedParams?.token)
    ? resolvedParams?.token[0]
    : resolvedParams?.token;

  const definition = decodeFormToken(tokenParam);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/60 px-4 py-16">
      {definition && tokenParam ? (
        <FormRenderer definition={definition} token={tokenParam} />
      ) : (
        <InvalidFormState />
      )}
    </div>
  );
}

