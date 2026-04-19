import API from "./api";

export type Loan = {
  _id: string;
  userId: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
};


export async function getLoans(userId?: string): Promise<Loan[]> {
  const res = await API.get("/api/loan", { params: userId ? { userId } : {} });
  if (Array.isArray(res.data?.loans)) return res.data.loans as Loan[];
  return [];
}

export async function repayLoan(loanId: string): Promise<{ success: boolean; message: string }> {
  const res = await API.post("/api/loan", { loanId });
  return res.data;
}
