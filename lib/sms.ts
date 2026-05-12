import AfricasTalking from 'africastalking';

function getSMS() {
  const username = process.env.AT_USERNAME!;
  const apiKey = process.env.AT_API_KEY!;
  const at = AfricasTalking({ apiKey, username });
  return at.SMS;
}

const senderId = process.env.AT_SENDER_ID || 'DosAgroLink';

export async function sendSMS(phone: string, message: string) {
  const sms = getSMS();
  return sms.send({
    to: [phone],
    message,
    from: senderId,
  });
}

export async function sendLoanApprovalSMS(phone: string, amount: number, repaymentDate: string) {
  return sendSMS(phone, `Your DosAgroLink loan of ₦${amount} is approved. Repay by ${repaymentDate}.`);
}

export async function sendListingConfirmedSMS(phone: string, commodity: string, quantity: number, price: number) {
  return sendSMS(phone, `Your ${commodity} listing (${quantity}kg @ ₦${price}/kg) is posted on DosAgroLink.`);
}

export async function sendPriceAlertSMS(phone: string, commodity: string, price: number, change: number) {
  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
  return sendSMS(phone, `${commodity} price is now ₦${price}/kg ${arrow}${change}% (DosAgroLink)`);
}
