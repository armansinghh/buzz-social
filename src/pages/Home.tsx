export default function Home() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded shadow">
          Post #{i + 1}
        </div>
      ))}
    </div>
  );
}
