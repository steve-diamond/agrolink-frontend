// Loan Service API route
// TODO: Replace with real database logic
let mockLoans = [
	{
		_id: "loan1",
		userId: "farmer1",
		amount: 100000,
		status: "active",
		dueDate: "2026-05-15",
		createdAt: "2026-03-01",
	},
	{
		_id: "loan2",
		userId: "farmer1",
		amount: 50000,
		status: "active",
		dueDate: "2026-06-01",
		createdAt: "2026-04-01",
	},
	{
		_id: "loan3",
		userId: "farmer2",
		amount: 75000,
		status: "repaid",
		dueDate: "2026-04-01",
		createdAt: "2026-01-01",
	},
];

export async function GET(request) {
	// Optionally filter by userId (e.g., /api/loan?userId=farmer1)
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");
	let loans = mockLoans;
	if (userId) {
		loans = loans.filter((loan) => loan.userId === userId);
	}
	return Response.json({ loans });
}

// Repay a loan (mock)
export async function POST(request) {
	const body = await request.json();
	const { loanId } = body;
	let found = false;
	mockLoans = mockLoans.map((loan) => {
		if (loan._id === loanId && loan.status === "active") {
			found = true;
			return { ...loan, status: "repaid" };
		}
		return loan;
	});
	if (found) {
		return Response.json({ success: true, message: "Loan repaid." });
	} else {
		return Response.json({ success: false, message: "Loan not found or already repaid." }, { status: 400 });
	}
}