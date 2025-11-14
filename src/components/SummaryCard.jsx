export default function SummaryCard({ title, value, highlight, positive, negative }) {
  let color = "text-gray-800";
  if (highlight) color = "text-primary";
  if (positive) color = "text-emerald-600";
  if (negative) color = "text-red-600";

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${color}`}>
        R$ {value.toFixed(2).replace(".", ",")}
      </p>
    </div>
  );
}
