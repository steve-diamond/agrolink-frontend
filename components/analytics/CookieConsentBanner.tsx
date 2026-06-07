"use client";

type Props = {
  onAccept: () => void;
  onReject: () => void;
};

export default function CookieConsentBanner({ onAccept, onReject }: Props) {
  return (
    <aside
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-100 mx-auto max-w-3xl rounded-2xl border border-green-200 bg-white p-4 shadow-2xl"
    >
      <p className="text-sm font-semibold text-green-950">Privacy & Analytics</p>
      <p className="mt-1 text-xs text-slate-600">
        We use analytics cookies to understand product usage, improve conversion funnels, and monitor performance.
        You can accept or decline non-essential tracking at any time.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-lg bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800"
        >
          Accept analytics cookies
        </button>
        <button
          type="button"
          onClick={onReject}
          className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          Reject non-essential cookies
        </button>
      </div>
    </aside>
  );
}
