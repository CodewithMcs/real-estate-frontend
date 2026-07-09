"use client";

import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import {
  PropertyCard,
  type PropertyCardData,
} from "@/components/property/PropertyCard";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FaFilter, FaMagnifyingGlass, FaRotateLeft } from "react-icons/fa6";

type PropertiesResponse = {
  success: boolean;
  message: string;
  data: {
    properties: PropertyCardData[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
};

type InquiryResponse = {
  success: boolean;
  message: string;
  data: {
    inquiry: {
      id: string;
      status: string;
    };
  };
};

type CountryOption = {
  id: number;
  name: string;
  iso2: string;
};

type StateOption = {
  id: number;
  country_id: number;
  name: string;
};

type CityOption = {
  id: number;
  state_id: number;
  name: string;
};

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
};

type PropertyTypeOption = {
  id: number;
  name: string;
  property_group: "flat" | "land" | "commercial";
};

type LookupResponse<TName extends string, TValue> = {
  data: Record<TName, TValue[]>;
};

export function PropertiesList() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const { isAuthenticated, user } = useAuth();
  const { error, hasLoaded, isLoading, response } = useApi<PropertiesResponse>({
    immediate: true,
    method: "GET",
    url: queryString ? `/properties?${queryString}` : "/properties",
  });
  const buyingRequest = useApi<InquiryResponse, { title: string; message: string }>();
  const [activePropertyId, setActivePropertyId] = useState("");
  const [errorPropertyId, setErrorPropertyId] = useState("");
  const [successPropertyId, setSuccessPropertyId] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [lookupError, setLookupError] = useState("");
  const [selectedStateId, setSelectedStateId] = useState(
    searchParams.get("state_id") ?? "",
  );
  const [selectedCityId, setSelectedCityId] = useState(
    searchParams.get("city_id") ?? "",
  );
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState(
    searchParams.get("property_type_id") ?? "",
  );

  const properties = (response?.data.properties ?? []).filter(
    (property) => !isAuthenticated || !user?.id || property.user_id !== user.id,
  );
  const totalProperties = response?.data.pagination.total ?? 0;
  const selectedPropertyType = propertyTypes.find(
    (type) => String(type.id) === selectedPropertyTypeId,
  );
  const selectedPropertyGroup = selectedPropertyType?.property_group;
  const showFlatFilters =
    !selectedPropertyGroup || selectedPropertyGroup === "flat";
  const showAreaFilters =
    !selectedPropertyGroup ||
    selectedPropertyGroup === "flat" ||
    selectedPropertyGroup === "land" ||
    selectedPropertyGroup === "commercial";
  const showBuildingFilters =
    !selectedPropertyGroup ||
    selectedPropertyGroup === "flat" ||
    selectedPropertyGroup === "commercial";
  const showFacingFilters =
    !selectedPropertyGroup ||
    selectedPropertyGroup === "flat" ||
    selectedPropertyGroup === "land";
  const categoryOptions = useMemo(
    () =>
      categories.filter((category) =>
        ["sale", "rent", "lease"].includes(category.slug),
      ),
    [categories],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadLookups() {
      setLookupError("");

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
        const [countriesResult, categoriesResult, propertyTypesResult] =
          await Promise.all([
            axios.get<LookupResponse<"countries", CountryOption>>(
              `${apiUrl}/countries`,
            ),
            axios.get<LookupResponse<"categories", CategoryOption>>(
              `${apiUrl}/categories`,
            ),
            axios.get<LookupResponse<"property_types", PropertyTypeOption>>(
              `${apiUrl}/property-types`,
            ),
          ]);
        const countries = countriesResult.data.data.countries ?? [];
        const india =
          countries.find((country) => country.iso2 === "IN") ?? countries[0];
        const statesResult = await axios.get<LookupResponse<"states", StateOption>>(
          `${apiUrl}/states${india ? `?country_id=${india.id}` : ""}`,
        );

        if (!isMounted) {
          return;
        }

        setCategories(categoriesResult.data.data.categories ?? []);
        setPropertyTypes(propertyTypesResult.data.data.property_types ?? []);
        setStates(statesResult.data.data.states ?? []);
      } catch {
        if (isMounted) {
          setLookupError("Unable to load filter options. Please refresh the page.");
        }
      }
    }

    loadLookups();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedStateId) {
      return;
    }

    let isMounted = true;

    async function loadCities() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
        const result = await axios.get<LookupResponse<"cities", CityOption>>(
          `${apiUrl}/cities?state_id=${selectedStateId}`,
        );

        if (isMounted) {
          setCities(result.data.data.cities ?? []);
        }
      } catch {
        if (isMounted) {
          setLookupError("Unable to load cities. Please select the state again.");
        }
      }
    }

    loadCities();

    return () => {
      isMounted = false;
    };
  }, [selectedStateId]);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const key of [
      "category_id",
      "state_id",
      "city_id",
      "property_type_id",
      "search",
      "min_price",
      "max_price",
      "min_area",
      "max_area",
      "area_unit",
      "bedrooms",
      "bathrooms",
      "furnishing_status",
      "parking",
      "ownership_type",
      "facing",
      "sort_by",
      "sort_order",
    ]) {
      const value = String(formData.get(key) ?? "").trim();

      if (value) {
        params.set(key, value);
      }
    }

    router.push(params.toString() ? `/properties?${params.toString()}` : "/properties");
  }

  function resetFilters() {
    formRef.current?.reset();
    setSelectedStateId("");
    setSelectedCityId("");
    setSelectedPropertyTypeId("");
    setCities([]);
    router.push("/properties");
  }

  async function sendBuyingRequest(property: PropertyCardData) {
    setActivePropertyId(property.id);
    setErrorPropertyId("");
    setSuccessPropertyId("");

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

    setActivePropertyId("");

    if (result?.success) {
      setSuccessPropertyId(property.id);
    } else {
      setErrorPropertyId(property.id);
    }
  }

  return (
    <>
      <form
        className="mt-8 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-5"
        onSubmit={handleFilterSubmit}
        ref={formRef}
      >
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-600">
            <FaFilter size={16} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-950">Advanced Filters</h2>
            <p className="text-sm text-gray-500">
              Refine by location, budget, area, and property details.
            </p>
          </div>
        </div>

        {lookupError ? (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {lookupError}
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select
            className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
            defaultValue={searchParams.get("category_id") ?? ""}
            name="category_id"
          >
            <option value="">All Listing Types</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
            name="state_id"
            onChange={(event) => {
              setSelectedStateId(event.target.value);
              setSelectedCityId("");
              setCities([]);
            }}
            value={selectedStateId}
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          <select
            className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            disabled={!selectedStateId}
            name="city_id"
            onChange={(event) => setSelectedCityId(event.target.value)}
            value={selectedCityId}
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          <select
            className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
            name="property_type_id"
            onChange={(event) => setSelectedPropertyTypeId(event.target.value)}
            value={selectedPropertyTypeId}
          >
            <option value="">All Property Types</option>
            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <input
            className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
            defaultValue={searchParams.get("search") ?? ""}
            name="search"
            placeholder="Title, address, keyword"
          />

          <input
            className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
            defaultValue={searchParams.get("min_price") ?? ""}
            min="0"
            name="min_price"
            placeholder="Min budget"
            type="number"
          />

          <input
            className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
            defaultValue={searchParams.get("max_price") ?? ""}
            min="0"
            name="max_price"
            placeholder="Max budget"
            type="number"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("sort_by") ?? ""}
              name="sort_by"
            >
              <option value="">Newest</option>
              <option value="price">Price</option>
              <option value="bedrooms">Bedrooms</option>
            </select>
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("sort_order") ?? ""}
              name="sort_order"
            >
              <option value="DESC">High to Low</option>
              <option value="ASC">Low to High</option>
            </select>
          </div>
        </div>

        {showAreaFilters ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("min_area") ?? ""}
              min="0"
              name="min_area"
              placeholder="Min area"
              type="number"
            />
            <input
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("max_area") ?? ""}
              min="0"
              name="max_area"
              placeholder="Max area"
              type="number"
            />
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("area_unit") ?? ""}
              name="area_unit"
            >
              <option value="">Any area unit</option>
              <option value="sq_ft">sq ft</option>
              <option value="sq_m">sq m</option>
              <option value="acres">acres</option>
              <option value="cents">cents</option>
            </select>
          </div>
        ) : null}

        {showFlatFilters ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("bedrooms") ?? ""}
              name="bedrooms"
            >
              <option value="">Any bedrooms</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="5">5+ BHK</option>
            </select>
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("bathrooms") ?? ""}
              name="bathrooms"
            >
              <option value="">Any bathrooms</option>
              <option value="1">1 Bathroom</option>
              <option value="2">2 Bathrooms</option>
              <option value="3">3 Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
            </select>
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("furnishing_status") ?? ""}
              name="furnishing_status"
            >
              <option value="">Any furnishing</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-furnished</option>
              <option value="furnished">Furnished</option>
            </select>
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("ownership_type") ?? ""}
              name="ownership_type"
            >
              <option value="">Any owner type</option>
              <option value="owner">Owner</option>
              <option value="builder">Builder</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        ) : null}

        {!showFlatFilters ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("ownership_type") ?? ""}
              name="ownership_type"
            >
              <option value="">Any owner type</option>
              <option value="owner">Owner</option>
              <option value="builder">Builder</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        ) : null}

        {showFacingFilters ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("facing") ?? ""}
              name="facing"
            >
              <option value="">Any facing</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="North East">North East</option>
              <option value="North West">North West</option>
              <option value="South East">South East</option>
              <option value="South West">South West</option>
            </select>
          </div>
        ) : null}

        {showBuildingFilters ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              className="h-12 min-w-0 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              defaultValue={searchParams.get("parking") ?? ""}
              name="parking"
            >
              <option value="">Any parking</option>
              <option value="1">Parking available</option>
              <option value="0">No parking</option>
            </select>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-300 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            onClick={resetFilters}
            type="button"
          >
            <FaRotateLeft size={14} />
            Reset
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-6 text-sm font-bold text-white transition-colors hover:bg-red-700"
            type="submit"
          >
            <FaMagnifyingGlass size={14} />
            Apply Filters
          </button>
        </div>
      </form>

      {hasLoaded && !error ? (
        <p className="mt-2 text-sm text-gray-600">
          Total properties: {totalProperties}
        </p>
      ) : null}

      {isLoading || !hasLoaded ? (
        <p className="mt-8 text-gray-700">Loading...</p>
      ) : null}
      {error ? <p className="mt-8 text-red-600">{error.message}</p> : null}

      {hasLoaded && !isLoading && !error ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {properties.length > 0 ? (
            properties.map((property) => {
              const isOwnProperty =
                isAuthenticated && user?.id && property.user_id === user.id;

              return (
                <PropertyCard
                  action={
                    <>
                      {isOwnProperty ? (
                        <p className="rounded-md bg-gray-100 px-3 py-2 text-center text-sm font-semibold text-gray-600">
                          Your listing
                        </p>
                      ) : isAuthenticated ? (
                        <button
                          className="w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                          disabled={
                            buyingRequest.isLoading &&
                            activePropertyId === property.id
                          }
                          onClick={() => void sendBuyingRequest(property)}
                          type="button"
                        >
                          {buyingRequest.isLoading &&
                          activePropertyId === property.id
                            ? "Sending..."
                            : "Send Buying Request"}
                        </button>
                      ) : (
                        <Link
                          className="block rounded-md bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700"
                          href="/auth/login"
                        >
                          Login to Buy
                        </Link>
                      )}
                      {successPropertyId === property.id ? (
                        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                          Buying request sent. Check My Activity.
                        </p>
                      ) : null}
                      {buyingRequest.error && errorPropertyId === property.id ? (
                        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                          {buyingRequest.error.message}
                        </p>
                      ) : null}
                      <FavoriteButton
                        className="mt-3 w-full"
                        isOwnProperty={Boolean(isOwnProperty)}
                        propertyId={property.id}
                      />
                    </>
                  }
                  key={property.id}
                  property={property}
                />
              );
            })
          ) : (
            <p className="text-gray-700">No properties found.</p>
          )}
        </div>
      ) : null}
    </>
  );
}
