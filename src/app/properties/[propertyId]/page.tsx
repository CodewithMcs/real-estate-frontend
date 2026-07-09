import { PropertyDetails } from "./PropertyDetails";
import type { Metadata } from "next";

type PropertyMetadataResponse = {
  data?: {
    property?: {
      title?: string;
      description?: string | null;
      price?: string | number | null;
      address?: string | null;
      city?: { name?: string };
      state?: { name?: string };
      property_type?: { name?: string };
      category?: { name?: string };
      media?: {
        file_url?: string;
        media_type?: string;
        is_primary?: number;
      }[];
    };
  };
};

function apiBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000/api"
  ).replace(/\/$/, "");
}

function mediaUrl(fileUrl?: string) {
  if (!fileUrl) {
    return undefined;
  }

  if (fileUrl.startsWith("http")) {
    return fileUrl;
  }

  return `${apiBaseUrl().replace(/\/api$/, "")}${fileUrl}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}): Promise<Metadata> {
  const { propertyId } = await params;

  try {
    const response = await fetch(`${apiBaseUrl()}/properties/${propertyId}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return {
        title: "Property not available",
      };
    }

    const result = (await response.json()) as PropertyMetadataResponse;
    const property = result.data?.property;

    if (!property) {
      return {
        title: "Property not available",
      };
    }

    const location = [property.address, property.city?.name, property.state?.name]
      .filter(Boolean)
      .join(", ");
    const title = `${property.title ?? "Property"}${location ? ` in ${location}` : ""}`;
    const description =
      property.description ||
      `${property.category?.name ?? "Property"} ${property.property_type?.name ?? "listing"}${location ? ` at ${location}` : ""}.`;
    const primaryImage = property.media?.find(
      (item) => item.media_type === "image" && item.is_primary === 1,
    ) ?? property.media?.find((item) => item.media_type === "image");
    const image = mediaUrl(primaryImage?.file_url);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [{ url: image }] : undefined,
        type: "website",
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {
      title: "Property details",
    };
  }
}

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;

  return <PropertyDetails propertyId={propertyId} />;
}
