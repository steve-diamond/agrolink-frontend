"use client";

export default function TryAgainButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800"
    >
      Try again
    </button>
  );
}
