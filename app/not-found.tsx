import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-800">
        404 Error
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-green-900 sm:text-4xl">Page Not Found</h1>
      <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
        The page you requested may have moved or no longer exists. Use the quick links below to continue exploring DOS Agrolink.
      </p>

      <nav aria-label="404 recovery links" className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        <Link href="/" className="rounded-xl border border-green-300 px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-50">
          Go to Homepage
        </Link>
        <Link href="/marketplace" className="rounded-xl border border-green-300 px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-50">
          Browse Marketplace
        </Link>
        <Link href="/vision" className="rounded-xl border border-green-300 px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-50">
          View Vision
        </Link>
        <Link href="/join-us" className="rounded-xl border border-green-300 px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-50">
          Join Our Network
        </Link>
      </nav>
    </main>
  );
}
