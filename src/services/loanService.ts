import API from "./api";

export type Loan = {
  _id: string;
  userId: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
};

type LoanListResponse = {
  data?: {
    loans?: unknown[];
    items?: unknown[];
    loan?: Loan;
  };
};

export type LoanApplicationPayload = {
  amountNeeded: number;
  loanPurpose: string;
  repaymentPeriod: string;
  farmSize?: number;
  cooperativeRating?: number;
  salesScore?: number;
};

const normalizeLoanList = (res: LoanListResponse): Loan[] => {
  const loans = res.data?.loans;
  if (Array.isArray(loans)) return loans as Loan[];

  const items = res.data?.items;
  if (Array.isArray(items)) return items as Loan[];

  return [];
};


export async function getLoans(userId?: string): Promise<Loan[]> {
  const res = await API.get<LoanListResponse>("/api/loan", { params: userId ? { userId } : {} });
  return normalizeLoanList(res);
}

export async function repayLoan(loanId: string): Promise<{ success: boolean; message: string }> {
  const res = await API.post<unknown, { data: { success: boolean; message: string } }>("/api/loan", { loanId });
  return res.data;
}

export async function submitLoanApplication(payload: LoanApplicationPayload): Promise<{ loan: Loan }> {
  const res = await API.post<LoanApplicationPayload, LoanListResponse>("/api/loan", payload);
  const loan = res.data?.loan;
  if (!loan) {
    throw new Error("Loan application submitted but response is missing loan details.");
  }
  return { loan };
}
