// Farming Tips API route
// TODO: Replace with real database logic
const mockTips = [
  { _id: "tip1", text: "Boost maize yield with split fertilizer timing." },
  { _id: "tip2", text: "Use early harvest sorting for better pricing." },
  { _id: "tip3", text: "Bundle logistics with nearby farmers." },
  { _id: "tip4", text: "Rotate crops to improve soil health." },
  { _id: "tip5", text: "Monitor weather forecasts for optimal planting." },
];

export async function GET() {
  return Response.json({ tips: mockTips });
}
