const values = [
  {
    title: "Integrity",
    description:
      "We maintain honesty and ethical responsibility in every real estate transaction, ensuring customers receive genuine and legally secure property opportunities.",
  },
  {
    title: "Customer-Centric Approach",
    description:
      "Understanding customer requirements and investment goals remains the centre of our business. Every development is planned to match buyer expectations and future growth potential.",
  },
  {
    title: "Commitment to Quality",
    description:
      "From project planning to documentation, we maintain strict quality standards to deliver reliable and well-structured property developments.",
  },
  {
    title: "Trust and Transparency",
    description:
      "Clear communication, verified approvals, and proper documentation help customers make safe investment decisions with confidence.",
  },
  {
    title: "Teamwork and Continuous Improvement",
    description:
      "Strong collaboration and industry expertise allow us to deliver better real estate solutions and build long-term customer relationships.",
  },
];

const beliefs = [
  "Every property transaction should create meaningful value for customers and investors.",
  "Ethical business practices strengthen long-term credibility and brand trust.",
  "Customer satisfaction remains the most important measure of success.",
  "Open and clear communication leads to better customer understanding and service delivery.",
  "Innovative thinking supports smarter and future ready real estate developments.",
  "Strong teamwork enhances project quality and customer experience.",
  "Trust grows through consistent transparency and professional responsibility.",
  "Property ownership should be an achievable goal for every aspiring buyer.",
  "Long-term success is defined by customer relationships and positive investment outcomes.",
];

export default function AboutPage() {
  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
            About Red Sand Group
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-950">
            Best Property Developer in Tambaram
          </h1>
          <p className="mt-5 text-lg leading-8 text-gray-700">
            Choosing the right property is one of the most important financial
            and emotional decisions in life. At Red Sand Group, we have been
            helping families and investors make confident property choices since
            2010.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-950">
              Trusted Real Estate Company in Tambaram
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-gray-700">
              <p>
                Over the years, we have earned recognition as one of the best
                property developers in Tambaram, offering reliable real estate
                solutions backed by transparency, legal clarity, and
                customer-focused service.
              </p>
              <p>
                As a trusted property developer near Tambaram, our goal is to
                create developments that provide both lifestyle comfort and
                long-term investment growth.
              </p>
              <p>
                With strong expertise in Chennai&apos;s rapidly expanding
                suburban real estate market, we carefully identify high-potential
                locations that offer excellent connectivity, infrastructure
                growth, and appreciation opportunities.
              </p>
            </div>
          </article>

          <article className="rounded-lg bg-red-600 p-6 text-white shadow-sm">
            <h2 className="text-2xl font-bold">Why Customers Trust Us</h2>
            <p className="mt-4 text-sm leading-7 text-red-50">
              Red Sand Group is known as a dependable Tambaram real estate
              company that prioritises customer trust above everything else.
              Every project is selected after thorough research, legal
              verification, and careful planning to support safe property
              investment.
            </p>
            <p className="mt-4 text-sm leading-7 text-red-50">
              For us, real estate is not simply about selling land or plots. It
              is about helping customers build financial stability, secure their
              family&apos;s future, and invest with confidence.
            </p>
          </article>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-950">Our Mission</h2>
            <p className="mt-4 text-sm leading-7 text-gray-700">
              Our mission is to deliver high-quality and legally verified
              property developments that help customers achieve safe and
              rewarding real estate investments. As a leading property developer
              in Tambaram, we focus on strategically located projects,
              transparent transactions, and personalised customer assistance at
              every stage of property ownership.
            </p>
          </article>

          <article className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-950">Our Vision</h2>
            <p className="mt-4 text-sm leading-7 text-gray-700">
              Our vision is to become the most trusted and preferred property
              developer in Tambaram and nearby Chennai suburbs by consistently
              delivering value driven developments and dependable real estate
              services.
            </p>
          </article>
        </div>

        <div className="mt-14">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-950">Our Values</h2>
            <p className="mt-3 text-sm leading-7 text-gray-700">
              The success of Red Sand Group is built on strong principles that
              guide every project, partnership, and customer interaction.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {values.map((value) => (
              <article className="rounded-lg bg-white p-5 shadow-sm" key={value.title}>
                <h3 className="text-lg font-bold text-gray-950">{value.title}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-700">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <article className="mt-14 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-950">Our Perspective</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-gray-700">
            <p>
              At Red Sand Group, we combine real estate expertise with market
              research and technology-driven insights to provide smarter
              property solutions.
            </p>
            <p>
              By closely studying infrastructure expansion, residential demand,
              and location growth patterns, we develop projects that support both
              living convenience and investment appreciation.
            </p>
            <p>
              Our customer-first approach simplifies property buying by offering
              professional guidance, transparent procedures, and dependable
              support.
            </p>
          </div>
        </article>

        <div className="mt-14">
          <h2 className="text-3xl font-bold text-gray-950">Our Beliefs</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-700">
            Strong principles and responsible service form the foundation of our
            success as one of the best property developers in Tambaram.
          </p>

          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {beliefs.map((belief) => (
              <li
                className="rounded-lg bg-white p-4 text-sm leading-6 text-gray-700 shadow-sm"
                key={belief}
              >
                {belief}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
