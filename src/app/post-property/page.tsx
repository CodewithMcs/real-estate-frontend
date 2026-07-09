"use client";

import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { authenticatedRequest } from "@/lib/authSession";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type CreatePropertyResponse = {
  success: boolean;
  message: string;
  data: {
    property: {
      id: string;
    };
  };
};

type CountryOption = {
  id: number;
  name: string;
  iso2: string;
  phone_code: string;
};

type StateOption = {
  id: number;
  country_id: number;
  name: string;
  code?: string | null;
};

type CityOption = {
  id: number;
  country_id: number;
  state_id: number;
  name: string;
};

type ListingOption = {
  id: number;
  name: string;
  slug: string;
};

type PropertyTypeOption = ListingOption & {
  property_group: string;
};

type LookupResponse<TName extends string, TValue> = {
  success: boolean;
  data: Record<TName, TValue[]>;
};

type SocialLink = {
  link: string;
  platform:
    | "facebook"
    | "instagram"
    | "youtube"
    | "linkedin"
    | "twitter"
    | "whatsapp"
    | "telegram"
    | "website";
};

export default function PostPropertyPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { error, isLoading: isSubmitting, request, response } =
    useApi<CreatePropertyResponse>();
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [categories, setCategories] = useState<ListingOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeOption[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState("");
  const [isLookupLoading, setIsLookupLoading] = useState(true);
  const [lookupError, setLookupError] = useState("");
  const [formError, setFormError] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { link: "", platform: "website" },
  ]);
  const [uploadError, setUploadError] = useState("");

  const india = countries.find((country) => country.id === Number(selectedCountryId));
  const selectedPropertyType = propertyTypes.find(
    (propertyType) => String(propertyType.id) === selectedPropertyTypeId,
  );
  const selectedPropertyGroup = selectedPropertyType?.property_group;
  const showFlatFields = selectedPropertyGroup === "flat";
  const showLandFields = selectedPropertyGroup === "land";
  const showCommercialFields = selectedPropertyGroup === "commercial";
  const showAreaFields =
    showFlatFields || showLandFields || showCommercialFields || !selectedPropertyGroup;
  const showFacingField = showFlatFields || showLandFields;
  const showParkingField = showFlatFields || showCommercialFields;

  useEffect(() => {
    let isMounted = true;

    async function loadMainLookups() {
      setIsLookupLoading(true);
      setLookupError("");

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
        const [countriesResult, categoriesResult, propertyTypesResult] =
          await Promise.all([
            axios.get<LookupResponse<"countries", CountryOption>>(
              `${apiUrl}/countries`,
            ),
            axios.get<LookupResponse<"categories", ListingOption>>(
              `${apiUrl}/categories`,
            ),
            axios.get<LookupResponse<"property_types", PropertyTypeOption>>(
              `${apiUrl}/property-types`,
            ),
          ]);

        if (!isMounted) {
          return;
        }

        const loadedCountries = countriesResult.data.data.countries ?? [];
        const indiaCountry =
          loadedCountries.find((country) => country.iso2 === "IN") ??
          loadedCountries.find((country) =>
            country.name.toLowerCase().includes("india"),
          ) ??
          loadedCountries[0];

        setCountries(loadedCountries);
        setCategories(categoriesResult.data.data.categories ?? []);
        setPropertyTypes(propertyTypesResult.data.data.property_types ?? []);
        setSelectedCountryId(indiaCountry ? String(indiaCountry.id) : "");
      } catch {
        if (isMounted) {
          setLookupError("Unable to load form options. Please refresh the page.");
        }
      } finally {
        if (isMounted) {
          setIsLookupLoading(false);
        }
      }
    }

    loadMainLookups();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCountryId) {
      return;
    }

    let isMounted = true;

    async function loadStates() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
        const result = await axios.get<LookupResponse<"states", StateOption>>(
          `${apiUrl}/states?country_id=${selectedCountryId}`,
        );

        if (!isMounted) {
          return;
        }

        const loadedStates = result.data.data.states ?? [];
        const tamilNadu =
          loadedStates.find((state) =>
            state.name.toLowerCase().includes("tamil nadu"),
          ) ?? loadedStates[0];

        setStates(loadedStates);
        setSelectedStateId(tamilNadu ? String(tamilNadu.id) : "");
      } catch {
        if (isMounted) {
          setLookupError("Unable to load states. Please refresh the page.");
        }
      }
    }

    loadStates();

    return () => {
      isMounted = false;
    };
  }, [selectedCountryId]);

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

        if (!isMounted) {
          return;
        }

        const loadedCities = result.data.data.cities ?? [];
        const chennai =
          loadedCities.find((city) =>
            city.name.toLowerCase().includes("chennai"),
          ) ?? loadedCities[0];

        setCities(loadedCities);
        setSelectedCityId(chennai ? String(chennai.id) : "");
      } catch {
        if (isMounted) {
          setLookupError("Unable to load cities. Please refresh the page.");
        }
      }
    }

    loadCities();

    return () => {
      isMounted = false;
    };
  }, [selectedStateId]);

  function updateSocialLink(index: number, socialLink: Partial<SocialLink>) {
    setSocialLinks((currentLinks) =>
      currentLinks.map((currentLink, currentIndex) =>
        currentIndex === index ? { ...currentLink, ...socialLink } : currentLink,
      ),
    );
  }

  function addSocialLink() {
    setSocialLinks((currentLinks) => [
      ...currentLinks,
      { link: "", platform: "website" },
    ]);
  }

  function removeSocialLink(index: number) {
    setSocialLinks((currentLinks) =>
      currentLinks.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  async function uploadPropertyImages(propertyId: string, files: File[]) {
    if (files.length === 0) {
      return;
    }

    const uploadData = new FormData();

    files.forEach((file) => uploadData.append("files", file));

    await authenticatedRequest({
      data: uploadData,
      method: "POST",
      url: `/properties/${propertyId}/media`,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError("");
    setFormError("");

    if (!selectedCountryId || !selectedStateId || !selectedCityId) {
      setFormError("Please select country, state, and city before submitting.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const imageFiles = formData
      .getAll("property_images")
      .filter((file): file is File => file instanceof File && file.size > 0);
    const propertySocialLinks = socialLinks
      .map((socialLink, index) => ({
        platform: socialLink.platform,
        link: socialLink.link.trim(),
        sort_order: index + 1,
        is_primary: index === 0 ? 1 : 0,
        status: 1,
      }))
      .filter((socialLink) => socialLink.link);
    const payload: Record<string, unknown> = {
      property_type_id: Number(formData.get("property_type_id")),
      category_id: Number(formData.get("category_id")),
      country_id: Number(selectedCountryId),
      state_id: Number(selectedStateId),
      city_id: Number(selectedCityId),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price")),
      ownership_type: String(formData.get("ownership_type") ?? "owner"),
      address: String(formData.get("address") ?? ""),
      pincode: String(formData.get("pincode") ?? ""),
      social_links: propertySocialLinks,
    };

    if (showAreaFields) {
      payload.area = formData.get("area") ? Number(formData.get("area")) : undefined;
      payload.area_unit = String(formData.get("area_unit") ?? "sq_ft");
    }

    if (showFlatFields) {
      payload.bedrooms = formData.get("bedrooms")
        ? Number(formData.get("bedrooms"))
        : undefined;
      payload.bathrooms = formData.get("bathrooms")
        ? Number(formData.get("bathrooms"))
        : undefined;
      payload.furnishing_status = String(formData.get("furnishing_status") ?? "");
    }

    if (showFacingField) {
      payload.facing = String(formData.get("facing") ?? "");
    }

    if (showParkingField) {
      payload.parking = formData.get("parking") === "1" ? 1 : 0;
    }

    const result = await request({
      data: payload,
      method: "POST",
      url: "/properties",
    });

    if (result?.success) {
      try {
        await uploadPropertyImages(result.data.property.id, imageFiles);
        event.currentTarget.reset();
        setSocialLinks([{ link: "", platform: "website" }]);
      } catch {
        setUploadError(
          "Property was created, but image upload failed. Please try uploading images again later.",
        );
      }
    }
  }

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-950">Login required</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please login before posting a property.
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

  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Sell Property
        </p>
        <h1 className="mt-3 text-4xl font-bold text-gray-950">
          Post your property
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
          Add basic property details. Your listing will be submitted for
          verification before it appears publicly.
        </p>

        {lookupError ? (
          <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {lookupError}
          </p>
        ) : null}

        <form
          className="mt-8 rounded-lg bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Listing Type
              <select
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                disabled={isLookupLoading || categories.length === 0}
                name="category_id"
                required
              >
                <option value="">Select listing type</option>
                {categories.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Property Type
              <select
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                disabled={isLookupLoading || propertyTypes.length === 0}
                name="property_type_id"
                onChange={(event) => setSelectedPropertyTypeId(event.target.value)}
                required
                value={selectedPropertyTypeId}
              >
                <option value="">Select property type</option>
                {propertyTypes.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700 md:col-span-2">
              Property Title
              <input
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                maxLength={150}
                name="title"
                placeholder="Example: Premium residential plot in Tambaram"
                required
                type="text"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Country
              <input
                className="h-12 rounded-md border border-gray-200 bg-gray-100 px-4 font-normal text-gray-700 outline-none"
                readOnly
                value={india ? `${india.name} (${india.phone_code})` : "India"}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              State
              <select
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                disabled={!selectedCountryId || states.length === 0}
                onChange={(event) => {
                  setSelectedStateId(event.target.value);
                  setSelectedCityId("");
                  setCities([]);
                }}
                required
                value={selectedStateId}
              >
                <option value="">Select state</option>
                {states.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              City
              <select
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                disabled={!selectedStateId || cities.length === 0}
                onChange={(event) => setSelectedCityId(event.target.value)}
                required
                value={selectedCityId}
              >
                <option value="">Select city</option>
                {cities.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Address
              <input
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                name="address"
                placeholder="Street, area, landmark"
                type="text"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Price
              <input
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                min="0"
                name="price"
                placeholder="Price"
                required
                type="number"
              />
            </label>

            {showAreaFields ? (
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Area
                <div className="grid grid-cols-[1fr_120px] gap-2">
                  <input
                    className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                    min="0"
                    name="area"
                    placeholder={
                      showLandFields ? "Plot area" : "Built-up area"
                    }
                    type="number"
                  />
                  <select
                    className="h-12 rounded-md border border-gray-300 px-3 font-normal text-gray-900 outline-none focus:border-red-500"
                    name="area_unit"
                  >
                    <option value="sq_ft">sq ft</option>
                    <option value="sq_m">sq m</option>
                    <option value="acres">acres</option>
                    <option value="cents">cents</option>
                  </select>
                </div>
              </label>
            ) : null}

            {showFlatFields ? (
              <>
                <label className="grid gap-2 text-sm font-medium text-gray-700">
                  Bedrooms
                  <input
                    className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                    min="0"
                    name="bedrooms"
                    placeholder="Bedrooms"
                    type="number"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-gray-700">
                  Bathrooms
                  <input
                    className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                    min="0"
                    name="bathrooms"
                    placeholder="Bathrooms"
                    type="number"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-gray-700">
                  Furnishing
                  <select
                    className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                    name="furnishing_status"
                  >
                    <option value="">Not applicable</option>
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi-furnished</option>
                    <option value="furnished">Furnished</option>
                  </select>
                </label>
              </>
            ) : null}

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Ownership
              <select
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                name="ownership_type"
              >
                <option value="owner">Owner</option>
                <option value="builder">Builder</option>
                <option value="agent">Agent</option>
              </select>
            </label>

            {showFacingField ? (
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Facing
                <select
                  className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                  name="facing"
                >
                  <option value="">Select facing</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North East">North East</option>
                  <option value="North West">North West</option>
                  <option value="South East">South East</option>
                  <option value="South West">South West</option>
                </select>
              </label>
            ) : null}

            {showParkingField ? (
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Parking
                <select
                  className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                  name="parking"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </label>
            ) : null}

            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Pincode
              <input
                className="h-12 rounded-md border border-gray-300 px-4 font-normal text-gray-900 outline-none focus:border-red-500"
                maxLength={10}
                name="pincode"
                placeholder="Pincode"
                type="text"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700 md:col-span-2">
              Description
              <textarea
                className="min-h-32 rounded-md border border-gray-300 px-4 py-3 font-normal text-gray-900 outline-none focus:border-red-500"
                name="description"
                placeholder="Describe the property, nearby landmarks, approvals, and key benefits"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-gray-700 md:col-span-2">
              Property Images
              <input
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                className="rounded-md border border-dashed border-gray-300 px-4 py-4 font-normal text-gray-900 outline-none file:mr-4 file:rounded-md file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-600 hover:file:bg-red-100"
                multiple
                name="property_images"
                type="file"
              />
              <span className="text-xs font-normal text-gray-500">
                Upload multiple images, videos, or documents. They are uploaded
                after the property is created.
              </span>
            </label>

            <div className="md:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    Social Media Links
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Add property video, website, WhatsApp, or social profile
                    links. These are saved as backend social links.
                  </p>
                </div>
                <button
                  className="w-fit rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  onClick={addSocialLink}
                  type="button"
                >
                  Add Link
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {socialLinks.map((socialLink, index) => (
                  <div
                    className="grid gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-[150px_1fr_auto]"
                    key={index}
                  >
                    <select
                      className="h-11 rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-red-500"
                      onChange={(event) =>
                        updateSocialLink(index, {
                          platform: event.target.value as SocialLink["platform"],
                        })
                      }
                      value={socialLink.platform}
                    >
                      <option value="website">Website</option>
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telegram">Telegram</option>
                    </select>
                    <input
                      className="h-11 rounded-md border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-red-500"
                      maxLength={500}
                      onChange={(event) =>
                        updateSocialLink(index, { link: event.target.value })
                      }
                      placeholder="https://example.com/property-link"
                      type="url"
                      value={socialLink.link}
                    />
                    <button
                      className="h-11 rounded-md px-3 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={socialLinks.length === 1}
                      onClick={() => removeSocialLink(index)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {response?.success ? (
            <p className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
              Property submitted successfully. It will appear after verification.
            </p>
          ) : null}
          {uploadError ? (
            <p className="mt-5 rounded-md bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              {uploadError}
            </p>
          ) : null}
          {formError ? (
            <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          ) : null}
          {error ? (
            <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error.message}
            </p>
          ) : null}

          <button
            className="mt-6 rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Submit Property"}
          </button>
        </form>
      </section>
    </main>
  );
}
