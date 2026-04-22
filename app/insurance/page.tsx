import QuoteCalculator from 'components/insurance/QuoteCalculator';
import Link from 'next/link';

const plans = [
  {
    name: 'Basic',
    price: 5000,
    coverage: 150000,
    features: 'Fire, flood, drought',
    payout: 'up to ₦150,000',
  },
  {
    name: 'Standard',
    price: 12000,
    coverage: 400000,
    features: 'Basic + pest/disease',
    payout: 'up to ₦400,000',
  },
  {
    name: 'Premium',
    price: 25000,
    coverage: 1000000,
    features: 'Full coverage + input replacement',
    payout: 'up to ₦1,000,000',
  },
];

const faqs = [
  {
    q: 'Who qualifies?',
    a: 'All registered farmers and cooperatives on DosAgrolink with verifiable farm locations and crops.'
  },
  {
    q: 'How are claims paid?',
    a: 'Claims are paid directly to your registered bank account after NAIC verification.'
  },
  {
    q: 'What crops are covered?',
    a: 'Maize, Cassava, Rice, Poultry, Fishery, Vegetables, and more. See full list in the application form.'
  },
  {
    q: 'How long does approval take?',
    a: 'Most policies are approved within 3 business days after application and verification.'
  },
  {
    q: 'Can I bundle with a DosAgrolink loan?',
    a: 'Yes! You can add insurance when applying for a loan and enjoy bundled benefits.'
  },
];

export default function InsuranceLandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-24">
      {/* Hero */}
      <div className="bg-[#2D6A4F] text-white py-12 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Protect Your Harvest, Secure Your Future</h1>
        <p className="text-lg mb-2">Powered by NAIC · Government-backed · As low as ₦5,000/season</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link href="/insurance/apply" className="btn bg-[#D4A017] text-[#2D6A4F] font-bold">Get a Quote</Link>
          <a href="#how-it-works" className="btn bg-white text-[#2D6A4F] border border-[#2D6A4F] font-bold">Learn How It Works</a>
        </div>
      </div>
      {/* Risk Disclosure */}
      <div className="bg-amber-200 text-amber-900 text-center py-2 px-4 font-medium">
        Agricultural investments carry risk. Returns are not guaranteed. DosAgrolink is registered with CAC. <a href="/docs/investor-disclosure" className="underline">Read our investor disclosure →</a>
      </div>
      {/* Coverage Plans */}
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-[#2D6A4F] mb-6 text-center">Coverage Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
              <div className="text-xl font-bold mb-2">{plan.name}</div>
              <div className="text-3xl font-bold text-[#D4A017] mb-2">₦{plan.price.toLocaleString()}</div>
              <div className="mb-2 text-gray-700">{plan.features}</div>
              <div className="mb-2 text-gray-500">{plan.payout}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Quote Calculator */}
      <QuoteCalculator />
      {/* FAQ Accordion */}
      <div id="how-it-works" className="max-w-3xl mx-auto mt-12 px-4">
        <h2 className="text-2xl font-bold text-[#2D6A4F] mb-4 text-center">Frequently Asked Questions</h2>
        <div className="divide-y divide-gray-200 rounded-2xl bg-white shadow-md">
          {faqs.map((faq, i) => (
            <details key={faq.q} className="p-4 group" open={i === 0}>
              <summary className="font-semibold cursor-pointer outline-none group-open:text-[#2D6A4F]">{faq.q}</summary>
              <div className="mt-2 text-gray-700">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
