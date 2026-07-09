"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        <p className="text-gray-600">Loading profile...</p>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-950">Login required</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please login to view your profile.
          </p>
          <Link
            className="mt-5 inline-flex rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white"
            href="/auth/login"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const userName = user.display_name ?? user.first_name ?? "User";

  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-950">{userName}</h1>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-500">Phone</p>
              <p className="mt-1 font-semibold text-gray-950">
                {user.phone ?? "Not available"}
              </p>
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-500">User ID</p>
              <p className="mt-1 font-semibold text-gray-950">{user.id}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
