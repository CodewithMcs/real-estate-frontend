"use client";

import { useApi } from "@/hooks/useApi";
import { useState, type FormEvent } from "react";
import { FaCircleCheck, FaXmark } from "react-icons/fa6";

const mapUrl =
  "https://www.google.com/maps?q=20%2C%20Elumalai%20St%2C%20West%20Tambaram%2C%20Tambaram%2C%20Chennai%2C%20Tamil%20Nadu%20600045&output=embed";

type ContactResponse = {
  success: boolean;
  message: string;
  data: {
    contact: {
      email: string;
      mobile: string;
      name: string;
    };
  };
};

type ContactPayload = {
  name: string;
  mobile: string;
  email: string;
  message: string;
};

export default function ContactPage() {
  const { error, isLoading, request } = useApi<ContactResponse, ContactPayload>();
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = await request({
      data: {
        name: String(formData.get("name") ?? ""),
        mobile: String(formData.get("mobile") ?? ""),
        email: String(formData.get("email") ?? ""),
        message: String(formData.get("message") ?? ""),
      },
      method: "POST",
      url: "/contact",
    });

    if (result?.success) {
      form.reset();
      setSuccessMessage(result.message);
    }
  }

  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Get in touch with us
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Share your property requirement or question. Our team will contact
            you shortly.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Contact Details</h3>
            <div className="mt-6 space-y-6 text-sm leading-6 text-gray-700">
              <div>
                <p className="font-semibold text-gray-950">Office Address</p>
                <a
                  className="mt-2 block hover:text-red-600"
                  href="https://www.google.com/maps/search/?api=1&query=20%2C%20Elumalai%20St%2C%20West%20Tambaram%2C%20Tambaram%2C%20Chennai%2C%20Tamil%20Nadu%20600045"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  INDIA DITS
                  <br />
                  20, Elumalai St, West Tambaram, Tambaram, Chennai, Tamil Nadu
                  - 600 045
                </a>
              </div>

              <div>
                <p className="font-semibold text-gray-950">Phone</p>
                <a className="mt-2 block hover:text-red-600" href="tel:+919025044044">
                  +91-9025044044
                </a>
              </div>

              <div>
                <p className="font-semibold text-gray-950">Email</p>
                <a
                  className="mt-2 block hover:text-red-600"
                  href="mailto:redsandgroup.in@gmail.com"
                >
                  redsandgroup.in@gmail.com
                </a>
              </div>
            </div>
          </aside>

          <form
            className="rounded-lg bg-white p-6 shadow-sm"
            onSubmit={handleSubmit}
          >
            <h3 className="text-xl font-bold text-gray-900">Connect with Us</h3>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Full Name
                <input
                  className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none transition-colors focus:border-red-500"
                  maxLength={100}
                  name="name"
                  placeholder="Enter your name"
                  required
                  type="text"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Mobile Number
                <span className="flex h-12 overflow-hidden rounded-md border border-gray-300 bg-white focus-within:border-red-500">
                  <span className="flex items-center gap-2 border-r border-gray-300 px-3 text-sm font-semibold text-gray-900">
                    <span aria-hidden="true">IN</span>
                    <span>+91</span>
                  </span>
                  <input
                    className="min-w-0 flex-1 px-4 font-normal text-gray-900 outline-none"
                    maxLength={10}
                    name="mobile"
                    pattern="[0-9]{10}"
                    placeholder="10 digit mobile number"
                    required
                    type="tel"
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-medium text-gray-700 sm:col-span-2">
                Email
                <input
                  className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none transition-colors focus:border-red-500"
                  maxLength={150}
                  name="email"
                  placeholder="Enter your email"
                  required
                  type="email"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-gray-700 sm:col-span-2">
                Message
                <textarea
                  className="min-h-36 rounded-md border border-gray-300 px-4 py-3 font-normal text-gray-900 outline-none transition-colors focus:border-red-500"
                  maxLength={1000}
                  name="message"
                  placeholder="Write your message"
                  required
                />
              </label>
            </div>

            {error ? (
              <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                {error.message}
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                className="mt-6 rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Submitting..." : "Submit Message"}
              </button>
            </div>

          </form>
        </div>

        <div className="mt-10 overflow-hidden rounded-lg bg-white shadow-sm">
          <iframe
            className="h-[340px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
            title="Red Sand Group office location map"
          />
        </div>
      </section>

      {successMessage ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 px-4 backdrop-blur-sm"
          onClick={() => setSuccessMessage("")}
          role="dialog"
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 text-gray-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                <FaCircleCheck size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-gray-950">
                  Message sent successfully
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {successMessage}
                </p>
              </div>
              <button
                aria-label="Close success message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-950"
                onClick={() => setSuccessMessage("")}
                type="button"
              >
                <FaXmark size={16} />
              </button>
            </div>
            <button
              className="mt-6 w-full rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              onClick={() => setSuccessMessage("")}
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
