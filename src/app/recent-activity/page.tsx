import { Suspense } from "react";
import { ActivityContent } from "./ActivityContent";

export default function RecentActivityPage() {
  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          My Activity
        </p>
        <h1 className="mt-3 text-4xl font-bold text-gray-950">
          Your property activity
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
          Track recently viewed properties, your posted listings, and enquiries
          from one simple dashboard.
        </p>

        <Suspense fallback={<p className="mt-8 text-gray-600">Loading...</p>}>
          <ActivityContent />
        </Suspense>
      </section>
    </main>
  );
}
