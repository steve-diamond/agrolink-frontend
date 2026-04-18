// Logistics Service API route
// TODO: Replace with real database logic
const mockShipments = [
	{
		_id: "shipment1",
		userId: "farmer1",
		status: "in_transit",
		from: "Abuja",
		to: "Kano",
		estimatedArrival: "2026-04-22",
		createdAt: "2026-04-15",
	},
	{
		_id: "shipment2",
		userId: "farmer2",
		status: "delivered",
		from: "Lagos",
		to: "Ibadan",
		estimatedArrival: "2026-04-10",
		createdAt: "2026-04-01",
	},
];

export async function GET(request) {
	// Optionally filter by userId (e.g., /api/logistics?userId=farmer1)
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");
	let shipments = mockShipments;
	if (userId) {
		shipments = shipments.filter((shipment) => shipment.userId === userId);
	}
	return Response.json({ shipments });
}