export default function Loading() {
  return (
    <div className="container-app py-6">
      <div className="skeleton mb-4 h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-2xl bg-white p-3">
            <div className="skeleton aspect-square w-full" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-2/3" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
