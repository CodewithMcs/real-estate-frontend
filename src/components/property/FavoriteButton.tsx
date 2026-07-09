"use client";

import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";
import { useState } from "react";
import { FaHeart } from "react-icons/fa6";

type FavoriteResponse = {
  success: boolean;
  message: string;
};

type FavoriteButtonProps = {
  className?: string;
  isOwnProperty?: boolean;
  propertyId: string;
};

export function FavoriteButton({
  className = "",
  isOwnProperty = false,
  propertyId,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const favoriteRequest = useApi<FavoriteResponse>();
  const [isFavorite, setIsFavorite] = useState(false);

  async function toggleFavorite() {
    const nextFavorite = !isFavorite;
    const result = await favoriteRequest.request({
      method: nextFavorite ? "POST" : "DELETE",
      url: `/properties/${propertyId}/favorite`,
    });

    if (result?.success) {
      setIsFavorite(nextFavorite);
    }
  }

  if (isOwnProperty) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Link
        className={`inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 ${className}`}
        href="/auth/login"
      >
        <FaHeart size={14} />
        Favorite
      </Link>
    );
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isFavorite
          ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
          : "border-red-200 text-red-600 hover:bg-red-50"
      } ${className}`}
      disabled={favoriteRequest.isLoading}
      onClick={() => void toggleFavorite()}
      type="button"
    >
      <FaHeart size={14} />
      {isFavorite ? "Favorited" : "Favorite"}
    </button>
  );
}
