import { Suspense } from "react";
import { PropertiesList } from "./PropertiesList";

export default function PropertiesPage() {
  return (
    <main className="flex flex-1 bg-gray-100">
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-bold text-black">Properties</h2>
        <p className="mt-4 text-lg text-gray-700">
          View all available property listings.
        </p>

        <Suspense fallback={<p className="mt-8 text-gray-700">Loading...</p>}>
          <PropertiesList />
        </Suspense>
      </section>
    </main>
  );
}
