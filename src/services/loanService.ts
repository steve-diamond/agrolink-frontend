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
  status?: string;
  message?: string;
  data?: {
    loans?: unknown[];
    items?: unknown[];
    loan?: Loan;
    success?: boolean;
    message?: string;
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
  const res = await API.post<unknown, LoanListResponse>("/api/loan", { loanId });

  const success =
    typeof res.data?.success === "boolean"
      ? res.data.success
      : String(res.status || "").toLowerCase() === "success";

  const message =
    res.data?.message ||
    res.message ||
    (success ? "Loan repayment submitted successfully." : "Loan repayment failed.");

  return { success, message };
}

export async function submitLoanApplication(payload: LoanApplicationPayload): Promise<{ loan: Loan }> {
  const res = await API.post<LoanApplicationPayload, LoanListResponse>("/api/loan", payload);
  const loan = res.data?.loan;
  if (!loan) {
    throw new Error("Loan application submitted but response is missing loan details.");
  }
  return { loan };
}
