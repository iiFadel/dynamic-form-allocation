const steps = [
  {
    title: "١. أرسل تعريف النموذج",
    body:
      "استخدم n8n لإرسال POST إلى /api/forms يحتوي على العنوان، قائمة الخدمات، قائمة الموظفين، ورابط الاستقبال.",
  },
  {
    title: "٢. شارك الرابط المولد",
    body:
      "سيتم إرجاع رابط فريد مثل /form/XYZ يمكن مشاركته مع الموظفين أو العملاء.",
  },
  {
    title: "٣. استلم الردود",
    body:
      "عند تعبئة النموذج يتم إرسال البيانات فوراً إلى الـ webhook الذي حددته.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl rounded-[2.5rem] bg-white/70 p-10 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
        <header className="space-y-4 text-right">
          <p className="text-sm font-semibold text-cyan-600">
            خدمة النماذج المولدة ذاتياً
          </p>
          <h1 className="text-4xl font-extrabold text-slate-900">
            أنشئ نموذجاً مخصصاً عبر webhook وشاركه بثوانٍ
          </h1>
          <p className="text-lg text-slate-600">
            استقبل تعريف النماذج من n8n، أرسل الرابط للمستخدم، ثم استقبل الردود
            تلقائياً عبر callback webhook من اختيارك.
          </p>
        </header>

        <section className="mt-10 grid gap-6 text-right sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-3xl border border-slate-100 bg-slate-50/70 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                {step.title}
              </h2>
              <p className="mt-3 text-sm text-slate-600">{step.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white">
          <h3 className="text-2xl font-bold">مثال لطلب POST من n8n</h3>
          <p className="mt-2 text-sm text-slate-200">
            حدّث رابط الخدمة بعد النشر على Vercel، ثم استخدم العقدة HTTP Request.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950/60 p-4 text-sm leading-7">
{`curl -X POST https://YOUR_APP_URL/api/forms \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "توزيع المهام اليومية",
    "description": "طلب #4821 - اشتراك بريميوم + زيارة ميدانية",
    "callbackUrl": "https://n8n.yourdomain.com/webhook/form-response",
    "services": [
      { "id": "srv-1", "name": "الاشتراك الذهبي" },
      { "id": "srv-2", "name": "حجز استشارة" }
    ],
    "workers": [
      { "id": "ali", "name": "علي" },
      { "id": "sara", "name": "سارة" },
      { "id": "noor", "name": "نور" }
    ]
  }'`}
          </pre>
          <p className="mt-4 text-sm text-slate-200">
            تستقبل الاستجابة رابط النموذج الجاهز للمشاركة بالإضافة إلى رقم
            النموذج لاستخدامه في السجلات.
          </p>
        </section>
      </div>
    </main>
  );
}
