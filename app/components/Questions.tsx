export type QuestionItem = { q: string; a: string };

// A visible "Common questions" block (plain headings and text, no hidden or collapsed content).
export default function Questions({
  title,
  items,
  asOf,
}: {
  title: string;
  items: QuestionItem[];
  asOf: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-[18px] font-extrabold text-gray-900 mb-5">{title}</h2>
      <div className="space-y-5">
        {items.map(({ q, a }) => (
          <div key={q}>
            <h3 className="text-[15px] font-bold text-gray-900">{q}</h3>
            <p className="mt-1 text-[15px] text-gray-600 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[12px] text-gray-400">Figures are calculated from the listings on this site as of {asOf}.</p>
    </section>
  );
}
