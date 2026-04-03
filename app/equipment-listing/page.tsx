export default function EquipmentListingPage() {
  const equipment = [
    { name: "Tractor Rental", status: "Available", zone: "North Central" },
    { name: "Power Tiller", status: "Limited", zone: "South West" },
    { name: "Irrigation Pump", status: "Available", zone: "North West" },
    { name: "Harvesting Kit", status: "Available", zone: "South East" },
  ];

  return (
    <main className="mx-auto grid max-w-5xl gap-5 py-6">
      <section className="card p-5">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-700">EQUIPMENT LISTING</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900">Farm Equipment Access</h1>
        <p className="mt-2 text-sm text-slate-700">
          Discover and request farm equipment to improve productivity and reduce manual effort.
        </p>
      </section>

      <section className="card overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-green-900 text-green-50">
            <tr>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Coverage Zone</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.name} className="border-b border-slate-200">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">{item.zone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
