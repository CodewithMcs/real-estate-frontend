"use client";

import {
  PropertyCard,
  type PropertyCardData,
} from "@/components/property/PropertyCard";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { authenticatedRequest } from "@/lib/authSession";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FaArrowRight, FaMagnifyingGlass } from "react-icons/fa6";

type PropertiesResponse = {
  data: {
    properties: PropertyCardData[];
  };
};

type BuyingRequestItem = {
  id: string;
  status?: string;
  property?: {
    id?: string;
  };
};

type BuyingRequestsResponse = {
  data: {
    buying_requests: BuyingRequestItem[];
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
  slug: string;
  property_group: "flat" | "land" | "commercial";
};

type LookupResponse<TName extends string, TValue> = {
  data: Record<TName, TValue[]>;
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [categorySlug, setCategorySlug] = useState("sale");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [buyRequestMessage, setBuyRequestMessage] = useState("");
  const [buyRequestError, setBuyRequestError] = useState("");
  const [buyRequestPropertyId, setBuyRequestPropertyId] = useState("");
  const [newRequestedPropertyIds, setNewRequestedPropertyIds] = useState<string[]>([]);
  const { error, hasLoaded, isLoading, request, response } =
    useApi<PropertiesResponse>({
    immediate: true,
    method: "GET",
    url: "/properties?limit=6",
  });
  const buyingRequests = useApi<BuyingRequestsResponse>({
    immediate: isAuthenticated,
    method: "GET",
    url: "/properties/my/buying-requests",
  });

  const completedRequestPropertyIdSet = useMemo(() => {
    const requestPropertyIds = (
      buyingRequests.response?.data.buying_requests ?? []
    )
      .filter((item) =>
        ["contacted", "closed"].includes(item.status ?? "pending"),
      )
      .map((item) => item.property?.id)
      .filter((id): id is string => Boolean(id));

    return new Set(requestPropertyIds);
  }, [buyingRequests.response]);
  const featuredProperties = (response?.data.properties ?? []).filter(
    (property) =>
      (!isAuthenticated || !user?.id || property.user_id !== user.id) &&
      !completedRequestPropertyIdSet.has(property.id),
  );
  const selectedCategory = categories.find(
    (category) => category.slug === categorySlug,
  );
  const propertyGoals = useMemo(
    () =>
      [
        { label: "Buy", slug: "sale" },
        { label: "Rent", slug: "rent" },
      ].filter((goal) =>
        categories.length
          ? categories.some((category) => category.slug === goal.slug)
          : true,
      ),
    [categories],
  );
  const requestedPropertyIdSet = useMemo(() => {
    const requestPropertyIds = (
      buyingRequests.response?.data.buying_requests ?? []
    )
      .filter((item) => (item.status ?? "pending") === "pending")
      .map((item) => item.property?.id)
      .filter((id): id is string => Boolean(id));

    return new Set([...requestPropertyIds, ...newRequestedPropertyIds]);
  }, [buyingRequests.response, newRequestedPropertyIds]);

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
          setLookupError("Unable to load search filters. Please refresh the page.");
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
          setLookupError("Unable to load cities. Please select state again.");
        }
      }
    }

    loadCities();

    return () => {
      isMounted = false;
    };
  }, [selectedStateId]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    params.set("limit", "6");

    if (selectedCategory) {
      params.set("category_id", String(selectedCategory.id));
    }

    for (const key of ["search", "state_id", "city_id", "property_type_id"]) {
      const value = String(formData.get(key) ?? "").trim();

      if (value) {
        params.set(key, value);
      }
    }

    setHasSearched(true);
    await request({
      method: "GET",
      url: `/properties?${params.toString()}`,
    });
  }

  async function sendBuyRequest(property: PropertyCardData) {
    setBuyRequestError("");
    setBuyRequestMessage("");

    if (requestedPropertyIdSet.has(property.id)) {
      setBuyRequestMessage("You already requested this property.");
      return;
    }

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role_id === 1) {
      setBuyRequestError("Admin cannot send buying requests.");
      return;
    }

    setBuyRequestPropertyId(property.id);

    try {
      await authenticatedRequest({
        data: {
          title: "Buying request",
          message: `I am interested in buying this property: ${
            property.title ?? "Property"
          }. Please contact me with more details.`,
        },
        method: "POST",
        url: `/properties/${property.id}/inquiries`,
      });
      setNewRequestedPropertyIds((current) =>
        current.includes(property.id) ? current : [...current, property.id],
      );
      setBuyRequestMessage("Buying request sent successfully.");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Unable to send buying request.";
      setBuyRequestError(message);
    } finally {
      setBuyRequestPropertyId("");
    }
  }

  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
            Red Sand Group
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-950 sm:text-4xl md:text-5xl">
            Find trusted properties across India.
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-700 sm:mt-5 sm:text-lg sm:leading-8">
            Search verified plots, apartments, villas, and commercial spaces
            using location, keyword, and property type filters.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            className="flex items-center justify-between gap-4 rounded-lg bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-md sm:p-5"
            onClick={() =>
              router.push(isAuthenticated ? "/properties" : "/auth/login")
            }
            type="button"
          >
            <span>
              <span className="block text-lg font-bold text-gray-950">
                Buy a property
              </span>
              <span className="mt-1 block text-sm text-gray-600">
                Login to browse and send buying requests.
              </span>
            </span>
            <FaArrowRight className="text-red-600" />
          </button>
          <button
            className="flex items-center justify-between gap-4 rounded-lg bg-red-600 p-4 text-left text-white shadow-sm transition-all hover:-translate-y-1 hover:bg-red-700 hover:shadow-md sm:p-5"
            onClick={() =>
              router.push(isAuthenticated ? "/post-property" : "/auth/login")
            }
            type="button"
          >
            <span>
              <span className="block text-lg font-bold">Sell your property</span>
              <span className="mt-1 block text-sm text-red-50">
                Login to post your property with images and videos.
              </span>
            </span>
            <FaArrowRight />
          </button>
        </div>

        <form
          className="mt-8 rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-200 sm:mt-10"
          onSubmit={handleSearch}
        >
          <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
            {propertyGoals.map((goal) => (
              <button
                className={`rounded-md px-5 py-2 text-sm font-semibold transition-colors ${
                  categorySlug === goal.slug
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`}
                key={goal.slug}
                onClick={() => setCategorySlug(goal.slug)}
                type="button"
              >
                {goal.label}
              </button>
            ))}
          </div>

          {lookupError ? (
            <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {lookupError}
            </p>
          ) : null}

          <div
            className="grid gap-3 pt-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
          >
            <select
              className="h-12 min-w-0 w-full rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              name="state_id"
              onChange={(event) => {
                setSelectedStateId(event.target.value);
                setSelectedCityId("");
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
              className="h-12 min-w-0 w-full rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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
            <input
              className="h-12 min-w-0 w-full rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              name="search"
              placeholder="Search title, address, keyword"
            />
            <select
              className="h-12 min-w-0 w-full rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
              name="property_type_id"
              onChange={(event) => {
                setSelectedPropertyTypeId(event.target.value);
              }}
              value={selectedPropertyTypeId}
            >
              <option value="">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <button
              className="inline-flex h-12 min-w-0 w-full items-center justify-center gap-2 rounded-md bg-red-600 px-6 text-sm font-bold text-white transition-colors hover:bg-red-700 lg:w-auto"
              type="submit"
            >
              <FaMagnifyingGlass size={15} />
              Search
            </button>
          </div>
        </form>

        <div className="mt-12 sm:mt-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                {hasSearched ? "Search results" : "Latest listings"}
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-950 sm:text-3xl">
                {hasSearched
                  ? "Properties matching your filters"
                  : "Explore properties with photos and videos"}
              </h2>
            </div>
            <button
              className="w-fit rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              onClick={() => router.push("/properties")}
              type="button"
            >
              View all
            </button>
          </div>

          {isLoading || !hasLoaded ? (
            <p className="mt-8 text-gray-700">Loading properties...</p>
          ) : null}
          {error ? <p className="mt-8 text-red-600">{error.message}</p> : null}

          {hasLoaded && !isLoading && !error ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {featuredProperties.length > 0 ? (
                featuredProperties.map((property) => (
                  (() => {
                    const isRequested = requestedPropertyIdSet.has(property.id);
                    const canSendRequest = user?.role_id !== 1;

                    return (
                  <PropertyCard
                    action={canSendRequest ? (
                      <button
                        className={`w-full rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed ${
                          isRequested
                            ? "bg-gray-100 text-gray-500"
                            : "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
                        }`}
                        disabled={isRequested || buyRequestPropertyId === property.id}
                        onClick={() => void sendBuyRequest(property)}
                        type="button"
                      >
                        {isRequested
                          ? "Requested"
                          : buyRequestPropertyId === property.id
                          ? "Sending..."
                          : isAuthenticated
                            ? "Send Buy Request"
                            : "Login to Buy"}
                      </button>
                    ) : undefined}
                    key={property.id}
                    property={property}
                  />
                    );
                  })()
                ))
              ) : (
                <p className="text-gray-700">No properties found.</p>
              )}
            </div>
          ) : null}
          {buyRequestMessage ? (
            <p className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {buyRequestMessage}
            </p>
          ) : null}
          {buyRequestError ? (
            <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {buyRequestError}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
