// Paystack utility for initializing transactions
export interface PaystackInitOptions {
  email: string;
  amount: number; // in kobo
  reference: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export function getPaystackUrl({ email, amount, reference, callback_url, metadata }: PaystackInitOptions) {
  const params = new URLSearchParams({
    email,
    amount: amount.toString(),
    reference,
    ...(callback_url ? { callback_url } : {}),
    ...(metadata ? { metadata: JSON.stringify(metadata) } : {}),
  });
  return `https://paystack.com/pay?${params.toString()}`;
}
