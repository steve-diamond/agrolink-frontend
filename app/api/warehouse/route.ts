// Warehouse Service API route
// TODO: Replace with real database logic
const mockStorage = [
	{
		_id: "storage1",
		userId: "farmer1",
		quantityKg: 1200,
		commodity: "Maize",
		warehouse: "Kano Central",
		createdAt: "2026-03-10",
	},
	{
		_id: "storage2",
		userId: "farmer1",
		quantityKg: 800,
		commodity: "Rice",
		warehouse: "Abuja North",
		createdAt: "2026-04-01",
	},
	{
		_id: "storage3",
		userId: "farmer2",
		quantityKg: 500,
		commodity: "Soybean",
		warehouse: "Lagos East",
		createdAt: "2026-02-15",
	},
];

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	// Optionally filter by userId (e.g., /api/warehouse?userId=farmer1)
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");
	let storage = mockStorage;
	if (userId) {
		storage = storage.filter((item) => item.userId === userId);
	}
	return Response.json({ storage });
}