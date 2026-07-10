"use client";

import {
  PropertyCard,
  propertyMediaUrl,
  type PropertyCardData,
  type PropertyMedia,
} from "@/components/property/PropertyCard";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";
import { useState } from "react";
import {
  FaFileLines,
  FaGlobe,
  FaImage,
  FaLink,
  FaVideo,
} from "react-icons/fa6";

type PropertyDetailsData = PropertyCardData & {
  balconies?: number | null;
  floor_number?: number | null;
  total_floors?: number | null;
  furnishing_status?: string | null;
  property_age?: number | null;
  parking?: number | null;
  facing?: string | null;
  ownership_type?: string | null;
  pincode?: string | null;
  country?: {
    name?: string;
  };
  amenities?: {
    id?: string;
    name?: string;
  }[];
  social_links?: {
    id?: string;
    platform?: string;
    link?: string;
    status?: number;
    sort_order?: number;
  }[];
};

type PropertyDetailsResponse = {
  success: boolean;
  data: {
    property: PropertyDetailsData;
  };
};

type InquiryResponse = {
  success: boolean;
  data: {
    inquiry: {
      id: string;
      status?: string;
    };
  };
};

type BuyingRequestsResponse = {
  data: {
    buying_requests: {
      id: string;
      status?: string;
      property?: {
        id?: string;
      };
    }[];
  };
};

type SimilarPropertiesResponse = {
  data: {
    properties: {
      property: PropertyCardData;
      similarity_score: number;
    }[];
  };
};

function formatLabel(value?: string | null) {
  return value ? value.replaceAll("-", " ") : "Not specified";
}

function getSortedMedia(media?: PropertyMedia[]) {
  return [...(media ?? [])].sort((first, second) => {
    if ((second.is_primary ?? 0) !== (first.is_primary ?? 0)) {
      return (second.is_primary ?? 0) - (first.is_primary ?? 0);
    }

    return Number(first.id ?? 0) - Number(second.id ?? 0);
  });
}

function getPropertyGroup(property?: PropertyDetailsData) {
  const explicitGroup = property?.property_type?.property_group;

  if (explicitGroup) {
    return explicitGroup;
  }

  const typeName = property?.property_type?.name?.toLowerCase() ?? "";

  if (typeName.includes("land") || typeName.includes("plot")) {
    return "land";
  }

  if (
    typeName.includes("office") ||
    typeName.includes("shop") ||
    typeName.includes("showroom") ||
    typeName.includes("warehouse") ||
    typeName.includes("commercial")
  ) {
    return "commercial";
  }

  return "flat";
}

function getPropertyDetailRows(property: PropertyDetailsData) {
  const propertyGroup = getPropertyGroup(property);
  const commonRows: [string, string | undefined | null][] = [
    ["Listing for", property.category?.name],
    ["Property type", property.property_type?.name],
    ["Area", property.area ? `${property.area} ${property.area_unit}` : ""],
    ["Pincode", property.pincode],
  ];
  const ownershipRows: [string, string | undefined | null][] = [
    ["Ownership", formatLabel(property.ownership_type)],
  ];

  if (propertyGroup === "land") {
    return [
      ...commonRows,
      ["Facing", property.facing],
      ...ownershipRows,
    ];
  }

  if (propertyGroup === "commercial") {
    return [
      ...commonRows,
      ["Floor", property.floor_number?.toString()],
      ["Total floors", property.total_floors?.toString()],
      ["Parking", property.parking ? "Available" : ""],
      ["Facing", property.facing],
      ...ownershipRows,
    ];
  }

  return [
    ...commonRows,
    ["Bedrooms", property.bedrooms?.toString()],
    ["Bathrooms", property.bathrooms?.toString()],
    ["Balconies", property.balconies?.toString()],
    ["Floor", property.floor_number?.toString()],
    ["Total floors", property.total_floors?.toString()],
    ["Furnishing", formatLabel(property.furnishing_status)],
    ["Age", property.property_age ? `${property.property_age} years` : ""],
    ["Parking", property.parking ? "Available" : ""],
    ["Facing", property.facing],
    ...ownershipRows,
  ];
}

function getActiveSocialLinks(property: PropertyDetailsData) {
  return [...(property.social_links ?? [])]
    .filter((item) => item.link && item.status !== 0)
    .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0));
}

function MediaImage({ alt, className, src }: { alt: string; className: string; src: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-400`}>
        <span className="flex flex-col items-center gap-2 text-xs font-semibold">
          <FaImage size={24} />
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      src={src}
    />
  );
}

export function PropertyDetails({ propertyId }: { propertyId: string }) {
  const { isAuthenticated, user } = useAuth();
  const propertyRequest = useApi<PropertyDetailsResponse>({
    immediate: true,
    method: "GET",
    url: `/properties/${propertyId}`,
  });
  const buyingRequest = useApi<InquiryResponse, { title: string; message: string }>();
  const similarRequest = useApi<SimilarPropertiesResponse>({
    immediate: true,
    method: "GET",
    url: `/properties/${propertyId}/similar?limit=3`,
  });
  const buyingRequests = useApi<BuyingRequestsResponse>({
    immediate: isAuthenticated,
    method: "GET",
    url: "/properties/my/buying-requests",
  });
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const property = propertyRequest.response?.data.property;
  const mediaItems = getSortedMedia(property?.media);
  const selectedMedia = mediaItems[selectedMediaIndex] ?? mediaItems[0];
  const detailRows = property ? getPropertyDetailRows(property) : [];
  const socialLinks = property ? getActiveSocialLinks(property) : [];
  const existingBuyingRequest = buyingRequests.response?.data.buying_requests.find(
    (request) => request.property?.id === property?.id,
  );
  const isOwnProperty = Boolean(
    isAuthenticated && user?.id && property?.user_id === user.id,
  );
  const isAdmin = user?.role_id === 1;

  async function sendBuyingRequest() {
    if (!property) {
      return;
    }

    setRequestMessage("");

    const result = await buyingRequest.request({
      data: {
        title: "Buying request",
        message: `I am interested in buying this property: ${
          property.title ?? "Property"
        }. Please contact me with more details.`,
      },
      method: "POST",
      url: `/properties/${property.id}/inquiries`,
    });

    if (result?.success) {
      setRequestMessage("Buying request sent. Check My Activity.");
      await buyingRequests.request({
        method: "GET",
        url: "/properties/my/buying-requests",
      });
    }
  }

  if (propertyRequest.isLoading || !propertyRequest.hasLoaded) {
    return (
      <main className="flex flex-1 bg-gray-50 px-6 py-16">
        <p className="mx-auto max-w-6xl text-gray-700">Loading property...</p>
      </main>
    );
  }

  if (propertyRequest.error || !property) {
    return (
      <main className="flex flex-1 bg-gray-50 px-6 py-16">
        <div className="mx-auto w-full max-w-6xl rounded-lg bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-950">
            Property not available
          </h1>
          <p className="mt-2 text-sm text-red-600">
            {propertyRequest.error?.message ?? "Unable to load property."}
          </p>
          <Link
            className="mt-5 inline-flex rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white"
            href="/properties"
          >
            Back to properties
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <Link className="text-sm font-semibold text-red-600 hover:text-red-700" href="/properties">
          Back to properties
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_380px]">
          <div>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
              {mediaItems.length > 0 ? (
                <div className="grid gap-2 p-2">
                  <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                    {selectedMedia.media_type === "video" ? (
                      <video
                        className="h-full w-full object-cover"
                        controls
                        src={propertyMediaUrl(selectedMedia.file_url)}
                      />
                    ) : selectedMedia.media_type === "image" ? (
                      <MediaImage
                        alt={property.title ?? "Property"}
                        className="h-full w-full object-cover"
                        key={selectedMedia.file_url}
                        src={propertyMediaUrl(selectedMedia.file_url)}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-red-600 shadow-sm">
                          <FaFileLines size={28} />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-gray-700">
                          Property document
                        </p>
                        <a
                          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          href={propertyMediaUrl(selectedMedia.file_url)}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Open document
                        </a>
                      </div>
                    )}
                  </div>

                  {mediaItems.length > 1 ? (
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                      {mediaItems.map((media, index) => (
                        <button
                          className={`relative aspect-video overflow-hidden rounded-md bg-gray-100 ring-2 ${
                            index === selectedMediaIndex
                              ? "ring-red-600"
                              : "ring-transparent"
                          }`}
                          key={media.id ?? media.file_url}
                          onClick={() => setSelectedMediaIndex(index)}
                          type="button"
                        >
                          {media.media_type === "video" ? (
                            <div className="flex h-full items-center justify-center bg-gray-900 text-white">
                              <FaVideo size={22} />
                            </div>
                          ) : media.media_type === "image" ? (
                            <MediaImage
                              alt={property.title ?? "Property"}
                              className="h-full w-full object-cover"
                              key={media.file_url}
                              src={propertyMediaUrl(media.file_url)}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-600">
                              <FaFileLines size={22} />
                            </div>
                          )}
                          <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-white">
                            {media.media_type === "image" ? "Photo" : media.media_type}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center bg-gray-200 text-sm font-semibold text-gray-500">
                  <FaImage className="mb-2 text-red-500" size={28} />
                  No media uploaded
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                {property.category?.name ?? "Property"} ·{" "}
                {property.property_type?.name ?? "Listing"}
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-950 md:text-4xl">
                {property.title ?? "Untitled Property"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {[
                  property.address,
                  property.city?.name,
                  property.state?.name,
                  property.country?.name,
                  property.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {property.price ? (
                <p className="mt-5 text-3xl font-bold text-gray-950">
                  Rs. {Number(property.price).toLocaleString("en-IN")}
                </p>
              ) : null}
              {property.description ? (
                <p className="mt-6 leading-8 text-gray-700">
                  {property.description}
                </p>
              ) : null}
              {socialLinks.length > 0 ? (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h2 className="text-base font-bold text-gray-950">
                    Social Links
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {socialLinks.map((item) => (
                      <a
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold capitalize text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        href={item.link}
                        key={item.id ?? item.link}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {item.platform === "website" ? (
                          <FaGlobe size={13} />
                        ) : (
                          <FaLink size={13} />
                        )}
                        {formatLabel(item.platform)}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="h-fit rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-gray-950">Property Details</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              {detailRows.map(([label, value]) => (
                <div
                  className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3"
                  key={label}
                >
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="text-right font-semibold text-gray-950">
                    {value || "Not specified"}
                  </dd>
                </div>
              ))}
            </dl>

            {property.amenities && property.amenities.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-950">Amenities</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                      key={amenity.id ?? amenity.name}
                    >
                      {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {property.owner ? (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="text-sm font-bold text-gray-950">
                  Owner Details
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-semibold text-gray-950">
                    {[
                      property.owner.first_name,
                      property.owner.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Owner"}
                  </p>
                  {property.owner.email ? (
                    <a
                      className="block text-gray-600 hover:text-red-600"
                      href={`mailto:${property.owner.email}`}
                    >
                      {property.owner.email}
                    </a>
                  ) : null}
                  {property.owner.phone ? (
                    <a
                      className="block text-gray-600 hover:text-red-600"
                      href={`tel:${property.owner.phone}`}
                    >
                      {property.owner.phone}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              {isOwnProperty ? (
                <p className="rounded-md bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-600">
                  This is your listing
                </p>
              ) : isAdmin ? (
                <p className="rounded-md bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-600">
                  Admin preview
                </p>
              ) : existingBuyingRequest ? (
                <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                    Buying request
                  </p>
                  <p className="mt-2 text-xl font-bold capitalize text-gray-950">
                    {formatLabel(existingBuyingRequest.status ?? "pending")}
                  </p>
                  <Link
                    className="mt-4 inline-flex w-full justify-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                    href="/recent-activity?activeTab=BUYING"
                  >
                    View request
                  </Link>
                </div>
              ) : isAuthenticated ? (
                <button
                  className="w-full rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  disabled={buyingRequest.isLoading}
                  onClick={() => void sendBuyingRequest()}
                  type="button"
                >
                  {buyingRequest.isLoading
                    ? "Sending..."
                    : "Send Buying Request"}
                </button>
              ) : (
                <Link
                  className="block rounded-md bg-red-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  href="/auth/login"
                >
                  Login to Buy
                </Link>
              )}
              {requestMessage ? (
                <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                  {requestMessage}
                </p>
              ) : null}
              {buyingRequest.error ? (
                <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {buyingRequest.error.message}
                </p>
              ) : null}
              <FavoriteButton
                className="mt-3 w-full"
                isOwnProperty={isOwnProperty}
                propertyId={property.id}
              />
            </div>
          </aside>
        </div>

        {similarRequest.response?.data.properties?.length ? (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-950">
              Similar Properties
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Explore more listings with a similar location, property type, and
              key details.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {similarRequest.response.data.properties.map((similar) => (
                <PropertyCard
                  key={similar.property.id}
                  property={similar.property}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
