"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function RegisterPage() {
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await register({
        first_name: String(formData.get("first_name") ?? ""),
        last_name: String(formData.get("last_name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Registration failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-2xl px-6 py-16">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-950">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to save your details and manage your property journey.
          </p>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              First Name
              <input
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                maxLength={50}
                name="first_name"
                placeholder="First name"
                type="text"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Last Name
              <input
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                maxLength={49}
                name="last_name"
                placeholder="Last name"
                type="text"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Email
              <input
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                maxLength={150}
                name="email"
                placeholder="Enter your email"
                type="email"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Phone
              <span className="flex h-12 overflow-hidden rounded-md border border-gray-300 bg-white focus-within:border-red-500">
                <span className="flex items-center border-r border-gray-300 px-3 text-sm font-semibold text-gray-900">
                  +91
                </span>
                <input
                  className="min-w-0 flex-1 px-4 font-normal text-gray-900 outline-none"
                  maxLength={20}
                  name="phone"
                  placeholder="10 digit mobile number"
                  type="tel"
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700 sm:col-span-2">
              Password
              <span className="flex h-12 overflow-hidden rounded-md border border-gray-300 bg-white focus-within:border-red-500">
                <input
                  className="min-w-0 flex-1 px-4 font-normal text-gray-900 outline-none"
                  maxLength={128}
                  name="password"
                  placeholder="Strong password"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex w-12 items-center justify-center text-gray-500 hover:text-red-600"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </span>
              <span className="text-xs font-normal text-gray-500">
                Use uppercase, lowercase, number, and special character.
              </span>
            </label>

            {error ? (
              <p className="text-sm text-red-600 sm:col-span-2">{error}</p>
            ) : null}

            <button
              className="h-12 rounded-md bg-red-600 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 sm:col-span-2"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-sm text-gray-600">
            Already have an account?{" "}
            <Link className="font-semibold text-red-600" href="/auth/login">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
