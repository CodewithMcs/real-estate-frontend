const residentialServices = [
  "Legally verified residential plots",
  "DTCP / RERA approved layouts",
  "Prime location selection with future growth potential",
  "Clear documentation and transparent transactions",
  "Customer guidance throughout the buying process",
];

const commercialServices = [
  "Strategically located commercial plots",
  "Layouts suitable for retail, office, and mixed-use development",
  "High-growth investment locations",
  "Proper planning and approval compliance",
  "Transparent property documentation",
];

const supportServices = [
  "Property consultation and investment guidance",
  "Documentation and approval assistance",
  "Site visit coordination",
  "Customer support throughout the buying journey",
  "Continuous assistance even after purchase",
];

const serviceSections = [
  {
    title: "Residential Layout Development",
    description:
      "Our residential layout projects are carefully designed to provide families with safe, peaceful, and well-connected living spaces. Red Sand Group focuses on developing layouts that combine accessibility, infrastructure planning, and investment growth potential.",
    details:
      "With years of experience as a reliable layout promoter in Tambaram, we ensure every residential project undergoes proper legal verification, planning approval, and structured development to provide customers with stress-free property investment opportunities.",
    services: residentialServices,
  },
  {
    title: "Commercial Layout Development",
    description:
      "Red Sand Group also develops commercial layouts that support business expansion and investment growth. Our commercial property planning focuses on high-demand locations that provide excellent accessibility, visibility, and infrastructure support for business development.",
    details:
      "As one of the trusted top layout promoters near Tambaram, we understand market demand and identify commercial layout opportunities that provide strong long-term returns and business potential.",
    services: commercialServices,
  },
  {
    title: "24/7 Real Estate Support Services",
    description:
      "Red Sand Group provides complete real estate support for buyers, investors, and realtors who require professional assistance throughout the property process.",
    details:
      "Whether you are a first-time buyer, investor, or real estate professional, our team works closely with you to simplify property transactions and ensure a smooth investment experience.",
    services: supportServices,
  },
];

export default function ServicesPage() {
  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
            Property Services
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-950">
            Top Layout Promoters in Tambaram
          </h1>
          <p className="mt-5 text-lg leading-8 text-gray-700">
            As trusted and top layout promoters near Tambaram, our developments
            focus on strategic locations with excellent connectivity,
            infrastructure expansion, and future appreciation potential.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-700">
            Every layout is designed with proper road access, planning
            standards, and compliance approvals to ensure safe and reliable
            property ownership.
          </p>
        </div>

        <div className="mt-10 grid gap-6">
          {serviceSections.map((section) => (
            <article
              className="rounded-lg bg-white p-6 shadow-sm"
              key={section.title}
            >
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <h2 className="text-2xl font-bold text-gray-950">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-gray-700">
                    {section.description}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-gray-700">
                    {section.details}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-5">
                  <h3 className="text-base font-bold text-gray-950">
                    Our services include
                  </h3>
                  <ul className="mt-4 grid gap-3 text-sm text-gray-700">
                    {section.services.map((service) => (
                      <li className="flex gap-3" key={service}>
                        <span className="mt-0.5 text-red-600">✓</span>
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
