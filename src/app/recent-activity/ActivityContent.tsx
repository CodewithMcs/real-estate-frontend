"use client";

import {
  PropertyCard,
  type PropertyCardData,
  propertyMediaUrl,
} from "@/components/property/PropertyCard";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { authenticatedRequest } from "@/lib/authSession";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  FaBuilding,
  FaCartShopping,
  FaClockRotateLeft,
  FaFloppyDisk,
  FaHeart,
  FaImage,
  FaInbox,
  FaPenToSquare,
  FaTrash,
  FaUpload,
  FaXmark,
} from "react-icons/fa6";

type Property = PropertyCardData;

type ViewedProperty = {
  id: string;
  count?: number;
  created_at?: string;
  property?: Property;
};

type FavoriteProperty = {
  property_id?: string;
  user_id?: string;
  created_at?: string;
  property?: Property;
};

type Inquiry = {
  id: string;
  title?: string;
  message?: string | null;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  status?: string;
  created_at?: string;
  property?: Property & {
    price?: string;
    owner?: {
      first_name?: string;
      last_name?: string | null;
      phone?: string | null;
    };
  };
  user?: {
    first_name?: string;
    last_name?: string | null;
    email?: string;
    phone?: string | null;
  };
};

function statusBadgeClass(status?: string) {
  if (status === "contacted") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "closed") {
    return "bg-gray-100 text-gray-600";
  }

  return "bg-red-50 text-red-600";
}

type PropertiesResponse = {
  data: {
    properties: Property[];
    pagination: {
      total: number;
    };
  };
};

type InquiriesResponse = {
  data: {
    inquiries: Inquiry[];
    pagination: {
      total: number;
    };
  };
};

type BuyingRequestsResponse = {
  data: {
    buying_requests: Inquiry[];
    pagination: {
      total: number;
    };
  };
};

type ViewedPropertiesResponse = {
  data: {
    viewed_properties: ViewedProperty[];
    pagination: {
      total: number;
    };
  };
};

type FavoritePropertiesResponse = {
  data: {
    favorites: FavoriteProperty[];
    pagination: {
      total: number;
    };
  };
};

const tabs = [
  { label: "Recently Viewed", value: "VIEWED", icon: FaClockRotateLeft },
  { label: "Favorites", value: "FAVORITES", icon: FaHeart },
  { label: "Buying Requests", value: "BUYING", icon: FaCartShopping },
  { label: "My Properties", value: "PROPERTIES", icon: FaBuilding },
  { label: "My Enquiries", value: "ENQUIRIES", icon: FaInbox },
];

export function ActivityContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("activeTab") ?? "VIEWED";
  const { isAuthenticated, isLoading } = useAuth();

  const myProperties = useApi<PropertiesResponse>({
    immediate: isAuthenticated,
    method: "GET",
    url: "/properties/my/list",
  });
  const myInquiries = useApi<InquiriesResponse>({
    immediate: isAuthenticated,
    method: "GET",
    url: "/properties/my/inquiries",
  });
  const buyingRequests = useApi<BuyingRequestsResponse>({
    immediate: isAuthenticated,
    method: "GET",
    url: "/properties/my/buying-requests",
  });
  const viewedProperties = useApi<ViewedPropertiesResponse>({
    immediate: isAuthenticated,
    method: "GET",
    url: "/properties/my/viewed",
  });
  const favoriteProperties = useApi<FavoritePropertiesResponse>({
    immediate: isAuthenticated,
    method: "GET",
    url: "/properties/my/favorites",
  });

  const properties = myProperties.response?.data.properties ?? [];
  const inquiries = myInquiries.response?.data.inquiries ?? [];
  const requests = buyingRequests.response?.data.buying_requests ?? [];
  const viewed = viewedProperties.response?.data.viewed_properties ?? [];
  const favorites = favoriteProperties.response?.data.favorites ?? [];

  if (isLoading) {
    return <p className="mt-8 text-gray-600">Loading activity...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-8 rounded-lg bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-gray-950">Login required</h2>
        <p className="mt-2 text-gray-600">
          Please login to view your activity.
        </p>
        <Link
          className="mt-5 inline-flex rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white"
          href="/auth/login"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 border-b border-gray-200">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;

            return (
              <Link
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-red-600"
                }`}
                href={`/recent-activity?activeTab=${tab.value}`}
                key={tab.value}
              >
                <Icon size={15} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {activeTab === "VIEWED" ? (
        <RecentlyViewed
          error={viewedProperties.error?.message}
          isLoading={viewedProperties.isLoading}
          viewedProperties={viewed}
        />
      ) : null}
      {activeTab === "FAVORITES" ? (
        <Favorites
          error={favoriteProperties.error?.message}
          favorites={favorites}
          isLoading={favoriteProperties.isLoading}
        />
      ) : null}
      {activeTab === "BUYING" ? (
        <BuyingRequests
          error={buyingRequests.error?.message}
          isLoading={buyingRequests.isLoading}
          requests={requests}
        />
      ) : null}
      {activeTab === "PROPERTIES" ? (
        <MyProperties
          error={myProperties.error?.message}
          isLoading={myProperties.isLoading}
          onChanged={() =>
            void myProperties.request({
              method: "GET",
              url: "/properties/my/list",
            })
          }
          properties={properties}
        />
      ) : null}
      {activeTab === "ENQUIRIES" ? (
        <MyEnquiries
          enquiries={inquiries}
          error={myInquiries.error?.message}
          isLoading={myInquiries.isLoading}
          onChanged={() =>
            void myInquiries.request({
              method: "GET",
              url: "/properties/my/inquiries",
            })
          }
        />
      ) : null}
    </>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-10 rounded-lg bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <FaInbox size={26} />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-gray-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
        {description}
      </p>
    </div>
  );
}

function RecentlyViewed({
  error,
  isLoading,
  viewedProperties,
}: {
  error?: string;
  isLoading: boolean;
  viewedProperties: ViewedProperty[];
}) {
  if (isLoading) {
    return <p className="mt-8 text-gray-600">Loading recently viewed...</p>;
  }

  if (error) {
    return <p className="mt-8 text-red-600">{error}</p>;
  }

  const properties = viewedProperties
    .map((viewedProperty) => viewedProperty.property)
    .filter((property): property is Property => Boolean(property));

  if (properties.length === 0) {
    return (
      <EmptyState
        description="You will see recently viewed properties here once property detail pages are opened."
        title="No recently viewed properties yet"
      />
    );
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function Favorites({
  error,
  favorites,
  isLoading,
}: {
  error?: string;
  favorites: FavoriteProperty[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="mt-8 text-gray-600">Loading favorites...</p>;
  }

  if (error) {
    return <p className="mt-8 text-red-600">{error}</p>;
  }

  const properties = favorites
    .map((favorite) => favorite.property)
    .filter((property): property is Property => Boolean(property));

  if (properties.length === 0) {
    return (
      <EmptyState
        description="Your favorite properties will appear here once you save listings."
        title="No favorite properties yet"
      />
    );
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function BuyingRequests({
  error,
  isLoading,
  requests,
}: {
  error?: string;
  isLoading: boolean;
  requests: Inquiry[];
}) {
  if (isLoading) {
    return <p className="mt-8 text-gray-600">Loading buying requests...</p>;
  }

  if (error) {
    return <p className="mt-8 text-red-600">{error}</p>;
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        description="Your buying requests will appear here after you send interest on another user's property."
        title="No buying requests yet"
      />
    );
  }

  return (
    <div className="mt-8 grid gap-4">
      {requests.map((request) => (
        <article
          className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
          key={request.id}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                Purchase request
              </p>
              <h2 className="mt-2 text-xl font-bold text-gray-950">
                {request.property?.title ?? request.title ?? "Property request"}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {[request.property?.address, request.property?.city?.name]
                  .filter(Boolean)
                  .join(", ") || "Location not available"}
              </p>
              {request.property?.owner ? (
                <p className="mt-2 text-sm text-gray-600">
                  Owner:{" "}
                  {[request.property.owner.first_name, request.property.owner.last_name]
                    .filter(Boolean)
                    .join(" ") || "Owner"}
                  {request.property.owner.phone
                    ? ` · ${request.property.owner.phone}`
                    : ""}
                </p>
              ) : null}
            </div>
            <div className="min-w-40 text-left sm:text-right">
              <span
                className={`inline-flex rounded px-3 py-1 text-sm font-semibold capitalize ${statusBadgeClass(request.status)}`}
              >
                {request.status ?? "pending"}
              </span>
              {request.property?.id ? (
                <Link
                  className="mt-3 inline-flex rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  href={`/properties/${request.property.id}`}
                >
                  View property
                </Link>
              ) : null}
              {request.property?.price ? (
                <p className="mt-3 text-lg font-bold text-gray-950">
                  Rs. {Number(request.property.price).toLocaleString("en-IN")}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-gray-500">
                {request.property?.category?.name ?? "Property"}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function MyProperties({
  error,
  isLoading,
  onChanged,
  properties,
}: {
  error?: string;
  isLoading: boolean;
  onChanged: () => void;
  properties: Property[];
}) {
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [activePropertyId, setActivePropertyId] = useState("");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  if (isLoading) {
    return <p className="mt-8 text-gray-600">Loading your properties...</p>;
  }

  if (error) {
    return <p className="mt-8 text-red-600">{error}</p>;
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        description="Your posted properties will appear here after you add a listing."
        title="No properties posted yet"
      />
    );
  }

  async function deleteProperty(propertyId: string) {
    const confirmed = window.confirm("Delete this property permanently?");

    if (!confirmed) {
      return;
    }

    setActivePropertyId(propertyId);
    setActionError("");
    setMessage("");

    try {
      await authenticatedRequest({
        method: "DELETE",
        url: `/properties/${propertyId}`,
      });
      setMessage("Property deleted successfully.");
      onChanged();
    } catch (err) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : "Unable to delete property.",
      );
    } finally {
      setActivePropertyId("");
    }
  }

  async function uploadImages(propertyId: string, files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const formData = new FormData();

    selectedFiles.forEach((file) => formData.append("files", file));
    setActivePropertyId(propertyId);
    setActionError("");
    setMessage("");

    try {
      await authenticatedRequest({
        data: formData,
        method: "POST",
        url: `/properties/${propertyId}/media`,
      });
      setMessage("Images uploaded successfully.");
      onChanged();
    } catch (err) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : "Unable to upload images.",
      );
    } finally {
      setActivePropertyId("");
    }
  }

  return (
    <>
      {message ? (
        <p className="mt-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      ) : null}
      {actionError ? (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {properties.map((property) => {
          const media = property.media?.find((item) => item.media_type === "image");
          const mediaUrl = propertyMediaUrl(media?.file_url);
          const location =
            [property.address, property.city?.name, property.state?.name]
              .filter(Boolean)
              .join(", ") || "Location not available";

          return (
            <article
              className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200"
              key={property.id}
            >
              <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
                <div className="relative min-h-44 bg-gray-100">
                  {mediaUrl ? (
                    <img
                      alt={property.title ?? "Property"}
                      className="h-full min-h-44 w-full object-cover"
                      src={mediaUrl}
                    />
                  ) : (
                    <div className="flex h-full min-h-44 flex-col items-center justify-center text-gray-500">
                      <FaImage size={26} />
                      <p className="mt-2 text-xs font-semibold">No image yet</p>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-950">
                        {property.title ?? "Untitled property"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {location}
                      </p>
                    </div>
                    <span className="w-fit rounded bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                      {property.category?.name ?? "Property"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
                    <span className="rounded bg-gray-100 px-2.5 py-1">
                      {property.property_type?.name ?? "Type"}
                    </span>
                    {property.area ? (
                      <span className="rounded bg-gray-100 px-2.5 py-1">
                        {property.area} {property.area_unit}
                      </span>
                    ) : null}
                    {property.bedrooms ? (
                      <span className="rounded bg-gray-100 px-2.5 py-1">
                        {property.bedrooms} Bed
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 text-lg font-bold text-red-600">
                    Rs. {Number(property.price ?? 0).toLocaleString("en-IN")}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                      href={`/properties/${property.id}`}
                    >
                      View
                    </Link>
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      onClick={() => setEditingProperty(property)}
                      type="button"
                    >
                      <FaPenToSquare size={13} />
                      Edit
                    </button>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                      <FaUpload size={13} />
                      Upload Media
                      <input
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        className="hidden"
                        disabled={activePropertyId === property.id}
                        multiple
                        onChange={(event) => {
                          void uploadImages(property.id, event.target.files);
                          event.target.value = "";
                        }}
                        type="file"
                      />
                    </label>
                    <button
                      className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300"
                      disabled={activePropertyId === property.id}
                      onClick={() => void deleteProperty(property.id)}
                      type="button"
                    >
                      <FaTrash size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {editingProperty ? (
        <EditPropertyModal
          onClose={() => setEditingProperty(null)}
          onSaved={() => {
            setMessage("Property updated successfully.");
            setEditingProperty(null);
            onChanged();
          }}
          property={editingProperty}
        />
      ) : null}
    </>
  );
}

function EditPropertyModal({
  onClose,
  onSaved,
  property,
}: {
  onClose: () => void;
  onSaved: () => void;
  property: Property;
}) {
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      property_type_id: Number(property.property_type?.id),
      category_id: Number(property.category?.id),
      country_id: Number(property.country?.id),
      state_id: Number(property.state?.id),
      city_id: Number(property.city?.id),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price")),
      address: String(formData.get("address") ?? ""),
      pincode: String(formData.get("pincode") ?? ""),
      area: property.area ? Number(property.area) : undefined,
      area_unit: property.area_unit,
      bedrooms: property.bedrooms ?? undefined,
      bathrooms: property.bathrooms ?? undefined,
    };

    try {
      await authenticatedRequest({
        data: payload,
        method: "PATCH",
        url: `/properties/${property.id}`,
      });
      onSaved();
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : "Unable to update property.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <form
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-950">Edit property</h2>
            <p className="mt-1 text-sm text-gray-600">
              Update the main listing details.
            </p>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-950"
            onClick={onClose}
            type="button"
          >
            <FaXmark size={16} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-gray-700 sm:col-span-2">
            Title
            <input
              className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
              defaultValue={property.title ?? ""}
              maxLength={150}
              name="title"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-gray-700">
            Price
            <input
              className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
              defaultValue={property.price ?? ""}
              min="0"
              name="price"
              required
              type="number"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-gray-700">
            Pincode
            <input
              className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
              defaultValue={property.pincode ?? ""}
              maxLength={10}
              name="pincode"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-gray-700 sm:col-span-2">
            Address
            <input
              className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
              defaultValue={property.address ?? ""}
              name="address"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-gray-700 sm:col-span-2">
            Description
            <textarea
              className="min-h-28 rounded-md border border-gray-300 px-4 py-3 font-normal text-gray-900 outline-none focus:border-red-500"
              defaultValue={property.description ?? ""}
              name="description"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300"
            disabled={isSaving}
            type="submit"
          >
            <FaFloppyDisk size={14} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function MyEnquiries({
  enquiries,
  error,
  isLoading,
  onChanged,
}: {
  enquiries: Inquiry[];
  error?: string;
  isLoading: boolean;
  onChanged: () => void;
}) {
  const [activeInquiryId, setActiveInquiryId] = useState("");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  async function updateInquiryStatus(inquiryId: string, status: "contacted" | "closed") {
    setActiveInquiryId(inquiryId);
    setMessage("");
    setActionError("");

    try {
      await authenticatedRequest({
        data: { status },
        method: "PATCH",
        url: `/properties/my/inquiries/${inquiryId}/status`,
      });
      setMessage(
        status === "contacted"
          ? "Enquiry marked as contacted."
          : "Enquiry closed.",
      );
      onChanged();
    } catch (err) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : "Unable to update enquiry status.",
      );
    } finally {
      setActiveInquiryId("");
    }
  }

  if (isLoading) {
    return <p className="mt-8 text-gray-600">Loading your enquiries...</p>;
  }

  if (error) {
    return <p className="mt-8 text-red-600">{error}</p>;
  }

  if (enquiries.length === 0) {
    return (
      <EmptyState
        description="New buying requests for your posted properties will appear here."
        title="No enquiries yet"
      />
    );
  }

  return (
    <>
      {message ? (
        <p className="mt-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      ) : null}
      {actionError ? (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}
      <div className="mt-8 grid gap-4">
        {enquiries.map((inquiry) => {
          const status = inquiry.status ?? "pending";
          const buyerName =
            [inquiry.user?.first_name, inquiry.user?.last_name]
              .filter(Boolean)
              .join(" ") ||
            inquiry.name ||
            "Buyer";
          const buyerEmail = inquiry.user?.email ?? inquiry.email;
          const buyerPhone = inquiry.user?.phone ?? inquiry.mobile;

          return (
            <article className="rounded-lg bg-white p-5 shadow-sm" key={inquiry.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                    Property enquiry
                  </p>
                  <h2 className="text-lg font-bold text-gray-950">
                    {inquiry.property?.title ?? inquiry.title ?? "Property enquiry"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {inquiry.message ?? inquiry.title ?? "Inquiry submitted"}
                  </p>
                  {inquiry.property?.id ? (
                    <Link
                      className="mt-2 inline-flex text-sm font-semibold text-red-600 hover:text-red-700"
                      href={`/properties/${inquiry.property.id}`}
                    >
                      View property
                    </Link>
                  ) : null}
                  <div className="mt-3 text-sm text-gray-600">
                    <p className="font-semibold text-gray-950">Buyer: {buyerName}</p>
                    {buyerEmail ? <p>{buyerEmail}</p> : null}
                    {buyerPhone ? <p>{buyerPhone}</p> : null}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <span
                    className={`w-fit rounded px-3 py-1 text-sm font-semibold capitalize ${statusBadgeClass(status)}`}
                  >
                    {status}
                  </span>
                  {status !== "closed" ? (
                    <div className="flex flex-wrap gap-2">
                      {status !== "contacted" ? (
                        <button
                          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                          disabled={activeInquiryId === inquiry.id}
                          onClick={() => void updateInquiryStatus(inquiry.id, "contacted")}
                          type="button"
                        >
                          Contacted
                        </button>
                      ) : null}
                      <button
                        className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                        disabled={activeInquiryId === inquiry.id}
                        onClick={() => void updateInquiryStatus(inquiry.id, "closed")}
                        type="button"
                      >
                        Closed
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
