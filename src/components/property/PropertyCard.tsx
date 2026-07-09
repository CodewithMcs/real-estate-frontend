"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  FaBath,
  FaBed,
  FaImage,
  FaLocationDot,
  FaRulerCombined,
  FaVideo,
} from "react-icons/fa6";

export type PropertyMedia = {
  id?: string;
  media_type?: "image" | "video" | "document";
  file_url?: string;
  is_primary?: number;
};

export type PropertyCardData = {
  id: string;
  user_id?: string;
  title?: string;
  address?: string;
  pincode?: string;
  price?: string;
  description?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: string;
  area_unit?: string;
  category?: {
    id?: string | number;
    name?: string;
    slug?: string;
  };
  country?: {
    id?: string | number;
    name?: string;
  };
  city?: {
    id?: string | number;
    name?: string;
  };
  state?: {
    id?: string | number;
    name?: string;
  };
  owner?: {
    id?: string | number;
    first_name?: string;
    last_name?: string | null;
    email?: string;
    phone?: string;
  };
  property_type?: {
    id?: string | number;
    name?: string;
    property_group?: "flat" | "land" | "commercial";
  };
  media?: PropertyMedia[];
};

type PropertyCardProps = {
  property: PropertyCardData;
  action?: ReactNode;
};

function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
}

export function propertyMediaUrl(fileUrl?: string) {
  if (!fileUrl) {
    return "";
  }

  if (fileUrl.startsWith("http")) {
    return fileUrl;
  }

  return `${apiBaseUrl().replace(/\/api\/?$/, "")}${fileUrl}`;
}

function getMainMedia(property: PropertyCardData) {
  return (
    property.media?.find(
      (media) => media.is_primary === 1 && media.media_type !== "document",
    ) ??
    property.media?.find((media) => media.media_type === "image") ??
    property.media?.find((media) => media.media_type === "video")
  );
}

export function PropertyCard({ action, property }: PropertyCardProps) {
  const media = getMainMedia(property);
  const mediaUrl = propertyMediaUrl(media?.file_url);
  const location =
    [property.address, property.city?.name, property.state?.name]
      .filter(Boolean)
      .join(", ") || "Location not available";
  const price = property.price
    ? `Rs. ${Number(property.price).toLocaleString("en-IN")}`
    : "Price on request";
  const badges = [
    property.property_type?.name,
    property.category?.name,
    property.area ? `${property.area} ${property.area_unit}` : "",
  ].filter(Boolean);

  return (
    <article className="group overflow-hidden rounded-lg bg-white text-black shadow-sm ring-1 ring-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link className="block" href={`/properties/${property.id}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {media?.media_type === "video" && mediaUrl ? (
            <video
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              muted
              playsInline
              preload="metadata"
              src={mediaUrl}
            />
          ) : media?.media_type === "image" && mediaUrl ? (
            <img
              alt={property.title ?? "Property"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={mediaUrl}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(135deg,#f8fafc_0%,#e5e7eb_100%)] px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-red-600 shadow-sm">
                <FaImage size={22} />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-700">
                Media coming soon
              </p>
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {property.category?.name ? (
              <span className="rounded bg-white/95 px-2.5 py-1 text-xs font-bold text-red-600 shadow-sm">
                {property.category.name}
              </span>
            ) : null}
            {media?.media_type === "video" ? (
              <span className="inline-flex items-center gap-1 rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white">
                <FaVideo size={11} />
                Video
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <p className="text-lg font-bold text-red-600">{price}</p>
        <Link href={`/properties/${property.id}`}>
          <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-7 text-gray-950 transition-colors hover:text-red-600">
            {property.title ?? "Untitled Property"}
          </h3>
        </Link>
        <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-gray-600">
          <FaLocationDot className="mt-1 shrink-0 text-red-500" size={13} />
          <span className="line-clamp-2">{location}</span>
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold text-gray-700">
          {property.bedrooms ? (
            <span className="inline-flex items-center justify-center gap-1 rounded bg-gray-100 px-2 py-2">
              <FaBed size={12} />
              {property.bedrooms} Bed
            </span>
          ) : null}
          {property.bathrooms ? (
            <span className="inline-flex items-center justify-center gap-1 rounded bg-gray-100 px-2 py-2">
              <FaBath size={12} />
              {property.bathrooms} Bath
            </span>
          ) : null}
          {property.area ? (
            <span className="inline-flex items-center justify-center gap-1 rounded bg-gray-100 px-2 py-2">
              <FaRulerCombined size={12} />
              {property.area} {property.area_unit}
            </span>
          ) : null}
        </div>

        {badges.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
            {badges.map((badge) => (
              <span className="rounded bg-red-50 px-2.5 py-1 text-red-700" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        {property.description ? (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
            {property.description}
          </p>
        ) : null}

        {action ? (
          <div className="mt-5 border-t border-gray-100 pt-4">{action}</div>
        ) : null}
      </div>
    </article>
  );
}
