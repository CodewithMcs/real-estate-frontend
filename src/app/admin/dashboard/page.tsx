"use client";

import { useAuth } from "@/context/AuthContext";
import { authenticatedRequest } from "@/lib/authSession";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  FaBuilding,
  FaCheck,
  FaCity,
  FaLayerGroup,
  FaLocationDot,
  FaInbox,
  FaRotate,
  FaTrash,
  FaUsers,
} from "react-icons/fa6";

type ApiList<TName extends string, TValue> = {
  data: Record<TName, TValue[]> & {
    pagination?: { total: number };
    overview?: Record<string, number>;
  };
};

type User = {
  id: string;
  first_name?: string;
  last_name?: string | null;
  email?: string;
  role?: { name?: string };
  status?: number;
  is_verified?: number;
};

type Property = {
  id: string;
  title?: string;
  price?: string;
  status?: number;
  is_verified?: number;
  owner?: {
    first_name?: string;
    last_name?: string | null;
    email?: string;
    phone?: string;
  };
  category?: { name?: string };
  property_type?: { name?: string };
};

type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  status: "pending" | "contacted" | "closed";
};

type PropertyInquiry = {
  id: string;
  title?: string;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  message?: string | null;
  status: "pending" | "contacted" | "closed";
  property?: {
    id: string;
    title?: string;
    owner?: { first_name?: string; email?: string };
  };
  user?: {
    first_name?: string;
    email?: string;
    phone?: string;
  };
};

type StateItem = {
  id: number;
  country_id?: number;
  name: string;
  code?: string | null;
  status: number;
};

type CityItem = {
  id: number;
  state_id: number;
  name: string;
  status: number;
  state?: { name?: string };
};

type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  status: boolean;
};

type PropertyTypeItem = CategoryItem & {
  property_group: "flat" | "land" | "commercial";
};

const tabs = [
  { key: "overview", label: "Overview", icon: FaLayerGroup },
  { key: "users", label: "Users", icon: FaUsers },
  { key: "properties", label: "Properties", icon: FaBuilding },
  { key: "enquiries", label: "Enquiries", icon: FaInbox },
  { key: "states", label: "States", icon: FaLocationDot },
  { key: "cities", label: "Cities", icon: FaCity },
  { key: "categories", label: "Categories", icon: FaLayerGroup },
  { key: "types", label: "Property Types", icon: FaBuilding },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [overview, setOverview] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [propertyInquiries, setPropertyInquiries] = useState<PropertyInquiry[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isAdmin = user?.role_id === 1;

  async function loadAdminData() {
    setError("");

    const requests = await Promise.allSettled([
      authenticatedRequest<ApiList<"overview", never>>({
        method: "GET",
        url: "/admin/master/overview",
      }),
      authenticatedRequest<ApiList<"users", User>>({
        method: "GET",
        url: "/admin/users?limit=100",
      }),
      authenticatedRequest<ApiList<"properties", Property>>({
        method: "GET",
        url: "/admin/properties?limit=100",
      }),
      authenticatedRequest<ApiList<"contact_inquiries", ContactInquiry>>({
        method: "GET",
        url: "/admin/inquiries/contact?limit=100",
      }),
      authenticatedRequest<ApiList<"property_inquiries", PropertyInquiry>>({
        method: "GET",
        url: "/admin/inquiries/properties?limit=100",
      }),
      authenticatedRequest<ApiList<"states", StateItem>>({
        method: "GET",
        url: "/admin/master/states",
      }),
      authenticatedRequest<ApiList<"cities", CityItem>>({
        method: "GET",
        url: "/admin/master/cities",
      }),
      authenticatedRequest<ApiList<"categories", CategoryItem>>({
        method: "GET",
        url: "/admin/master/categories",
      }),
      authenticatedRequest<ApiList<"property_types", PropertyTypeItem>>({
        method: "GET",
        url: "/admin/master/property-types",
      }),
    ]);

    const hasCriticalFailure = requests
      .slice(0, 3)
      .some((request) => request.status === "rejected");

    if (requests[0].status === "fulfilled") {
      setOverview(requests[0].value.data.data.overview ?? {});
    }

    if (requests[1].status === "fulfilled") {
      setUsers(requests[1].value.data.data.users ?? []);
    }

    if (requests[2].status === "fulfilled") {
      setProperties(requests[2].value.data.data.properties ?? []);
    }

    if (requests[3].status === "fulfilled") {
      setContactInquiries(requests[3].value.data.data.contact_inquiries ?? []);
    } else {
      setContactInquiries([]);
    }

    if (requests[4].status === "fulfilled") {
      setPropertyInquiries(requests[4].value.data.data.property_inquiries ?? []);
    } else {
      setPropertyInquiries([]);
    }

    if (requests[5].status === "fulfilled") {
      setStates(requests[5].value.data.data.states ?? []);
    }

    if (requests[6].status === "fulfilled") {
      setCities(requests[6].value.data.data.cities ?? []);
    }

    if (requests[7].status === "fulfilled") {
      setCategories(requests[7].value.data.data.categories ?? []);
    }

    if (requests[8].status === "fulfilled") {
      setPropertyTypes(requests[8].value.data.data.property_types ?? []);
    }

    if (hasCriticalFailure) {
      setError("Unable to load some admin data. Please check admin access and backend server.");
    }
  }

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      queueMicrotask(() => {
        void loadAdminData();
      });
    }
  }, [isAuthenticated, isAdmin]);

  async function runAction(successMessage: string, action: () => Promise<void>) {
    setError("");
    setMessage("");

    try {
      await action();
      setMessage(successMessage);
      await loadAdminData();
    } catch {
      setError("Action failed. Please try again.");
    }
  }

  async function saveState(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await runAction("State saved.", async () => {
      await authenticatedRequest({
        data: Object.fromEntries(formData),
        method: "POST",
        url: "/admin/master/states",
      });
    });
    event.currentTarget.reset();
  }

  async function saveCity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await runAction("City saved.", async () => {
      await authenticatedRequest({
        data: Object.fromEntries(formData),
        method: "POST",
        url: "/admin/master/cities",
      });
    });
    event.currentTarget.reset();
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await runAction("Category saved.", async () => {
      await authenticatedRequest({
        data: Object.fromEntries(formData),
        method: "POST",
        url: "/admin/master/categories",
      });
    });
    event.currentTarget.reset();
  }

  async function savePropertyType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await runAction("Property type saved.", async () => {
      await authenticatedRequest({
        data: Object.fromEntries(formData),
        method: "POST",
        url: "/admin/master/property-types",
      });
    });
    event.currentTarget.reset();
  }

  if (isLoading) {
    return <main className="flex flex-1 items-center justify-center bg-gray-50 p-8">Loading...</main>;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="flex flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-950">Admin access required</h1>
          <p className="mt-2 text-sm text-gray-600">Only admin users can access this dashboard.</p>
          <Link className="mt-5 inline-flex rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white" href="/">
            Go home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 bg-gray-50">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Admin</p>
            <h1 className="mt-2 text-4xl font-bold text-gray-950">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">Manage users, properties, locations, categories, and property types.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white" onClick={() => void loadAdminData()} type="button">
            <FaRotate size={14} />
            Refresh
          </button>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
                  activeTab === tab.key ? "border-red-600 text-red-600" : "border-transparent text-gray-600 hover:text-red-600"
                }`}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {message ? <p className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        {activeTab === "overview" ? <Overview overview={overview} /> : null}
        {activeTab === "users" ? <UsersTable runAction={runAction} users={users} /> : null}
        {activeTab === "properties" ? <PropertiesTable properties={properties} runAction={runAction} /> : null}
        {activeTab === "enquiries" ? (
          <EnquiriesPanel
            contactInquiries={contactInquiries}
            propertyInquiries={propertyInquiries}
            runAction={runAction}
          />
        ) : null}
        {activeTab === "states" ? <StatesPanel onSubmit={saveState} runAction={runAction} states={states} /> : null}
        {activeTab === "cities" ? <CitiesPanel cities={cities} onSubmit={saveCity} runAction={runAction} states={states} /> : null}
        {activeTab === "categories" ? <CategoriesPanel categories={categories} onSubmit={saveCategory} runAction={runAction} /> : null}
        {activeTab === "types" ? <PropertyTypesPanel onSubmit={savePropertyType} propertyTypes={propertyTypes} runAction={runAction} /> : null}
      </section>
    </main>
  );
}

function Overview({ overview }: { overview: Record<string, number> }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Object.entries(overview).map(([key, value]) => (
        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200" key={key}>
          <p className="text-sm font-semibold capitalize text-gray-500">{key.replaceAll("_", " ")}</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">{value}</p>
        </div>
      ))}
    </div>
  );
}

function UsersTable({ runAction, users }: { runAction: (message: string, action: () => Promise<void>) => Promise<void>; users: User[] }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
          <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Verified</th><th className="px-4 py-3">Actions</th></tr>
        </thead>
        <tbody>
          {users.map((item) => (
            <tr className="border-t border-gray-100" key={item.id}>
              <td className="px-4 py-3 font-semibold text-gray-950">{[item.first_name, item.last_name].filter(Boolean).join(" ")}<p className="font-normal text-gray-500">{item.email}</p></td>
              <td className="px-4 py-3 capitalize">{item.role?.name ?? "user"}</td>
              <td className="px-4 py-3">{item.status ? "Active" : "Inactive"}</td>
              <td className="px-4 py-3">{item.is_verified ? "Approved" : "Pending"}</td>
              <td className="space-x-2 px-4 py-3">
                {item.role?.name === "admin" ? (
                  <span className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600">
                    Protected
                  </span>
                ) : (
                  <>
                    <button className="rounded-md border px-3 py-2 font-semibold" onClick={() => runAction("User status updated.", () => authenticatedRequest({ data: { status: item.status ? 0 : 1 }, method: "PATCH", url: `/admin/users/${item.id}/status` }).then(() => undefined))} type="button">{item.status ? "Inactive" : "Active"}</button>
                    <button className="rounded-md bg-red-600 px-3 py-2 font-semibold text-white" onClick={() => runAction("User approval updated.", () => authenticatedRequest({ data: { is_verified: item.is_verified ? 0 : 1 }, method: "PATCH", url: `/admin/users/${item.id}/verify` }).then(() => undefined))} type="button">{item.is_verified ? "Unapprove" : "Approve"}</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PropertiesTable({ properties, runAction }: { properties: Property[]; runAction: (message: string, action: () => Promise<void>) => Promise<void> }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
          <tr><th className="px-4 py-3">Property</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
        </thead>
        <tbody>
          {properties.map((item) => (
            <tr className="border-t border-gray-100" key={item.id}>
              <td className="px-4 py-3 font-semibold text-gray-950">{item.title}<p className="font-normal text-gray-500">{item.category?.name}</p></td>
              <td className="px-4 py-3">
                <p className="font-semibold text-gray-950">
                  {[item.owner?.first_name, item.owner?.last_name]
                    .filter(Boolean)
                    .join(" ") || "Owner"}
                </p>
                {item.owner?.email ? (
                  <p className="text-gray-500">{item.owner.email}</p>
                ) : null}
                {item.owner?.phone ? (
                  <p className="text-gray-500">{item.owner.phone}</p>
                ) : null}
              </td>
              <td className="px-4 py-3">{item.property_type?.name ?? "Type"}</td>
              <td className="px-4 py-3">Rs. {Number(item.price ?? 0).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3">{item.status ? "Active" : "Inactive"} / {item.is_verified ? "Approved" : "Pending"}</td>
              <td className="space-x-2 px-4 py-3">
                <Link className="rounded-md border border-gray-300 px-3 py-2 font-semibold text-gray-700" href={`/properties/${item.id}`}>
                  View
                </Link>
                <button className="rounded-md border px-3 py-2 font-semibold" onClick={() => runAction("Property status updated.", () => authenticatedRequest({ data: { status: item.status ? 0 : 1 }, method: "PATCH", url: `/admin/properties/${item.id}/status` }).then(() => undefined))} type="button">{item.status ? "Inactive" : "Active"}</button>
                <button className="rounded-md bg-red-600 px-3 py-2 font-semibold text-white" onClick={() => runAction("Property approval updated.", () => authenticatedRequest({ data: { is_verified: item.is_verified ? 0 : 1 }, method: "PATCH", url: `/admin/properties/${item.id}/verify` }).then(() => undefined))} type="button">{item.is_verified ? "Unapprove" : "Approve"}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EnquiriesPanel({
  contactInquiries,
  propertyInquiries,
  runAction,
}: {
  contactInquiries: ContactInquiry[];
  propertyInquiries: PropertyInquiry[];
  runAction: (message: string, action: () => Promise<void>) => Promise<void>;
}) {
  return (
    <div className="mt-8 grid gap-8">
      <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-100 px-4 py-4">
          <h2 className="text-lg font-bold text-gray-950">Contact Enquiries</h2>
          <p className="mt-1 text-sm text-gray-500">
            Messages submitted from the Contact page.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contactInquiries.length > 0 ? (
                contactInquiries.map((inquiry) => (
                  <tr className="border-t border-gray-100" key={inquiry.id}>
                    <td className="px-4 py-3 font-semibold text-gray-950">
                      {inquiry.name}
                    </td>
                    <td className="px-4 py-3">
                      <p>{inquiry.mobile}</p>
                      <p className="text-gray-500">{inquiry.email}</p>
                    </td>
                    <td className="max-w-md px-4 py-3 text-gray-600">
                      {inquiry.message}
                    </td>
                    <td className="px-4 py-3 capitalize">{inquiry.status}</td>
                    <td className="space-x-2 px-4 py-3">
                      {["pending", "contacted", "closed"].map((status) => (
                        <button
                          className={`rounded-md px-3 py-2 text-sm font-semibold ${
                            inquiry.status === status
                              ? "bg-red-600 text-white"
                              : "border border-gray-300 text-gray-700"
                          }`}
                          key={status}
                          onClick={() =>
                            runAction("Contact enquiry status updated.", () =>
                              authenticatedRequest({
                                data: { status },
                                method: "PATCH",
                                url: `/admin/inquiries/contact/${inquiry.id}/status`,
                              }).then(() => undefined),
                            )
                          }
                          type="button"
                        >
                          {status}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                    No contact enquiries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-100 px-4 py-4">
          <h2 className="text-lg font-bold text-gray-950">Property Enquiries</h2>
          <p className="mt-1 text-sm text-gray-500">
            Buying requests and listing enquiries for every property.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {propertyInquiries.length > 0 ? (
                propertyInquiries.map((inquiry) => {
                  const customerName =
                    inquiry.user?.first_name ?? inquiry.name ?? "Customer";
                  const customerEmail = inquiry.user?.email ?? inquiry.email;
                  const customerPhone = inquiry.user?.phone ?? inquiry.mobile;

                  return (
                    <tr className="border-t border-gray-100" key={inquiry.id}>
                      <td className="px-4 py-3 font-semibold text-gray-950">
                        {inquiry.property?.title ?? inquiry.title ?? "Property enquiry"}
                        {inquiry.property?.id ? (
                          <Link
                            className="mt-1 block text-xs font-semibold text-red-600"
                            href={`/properties/${inquiry.property.id}`}
                          >
                            View property
                          </Link>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p>{customerName}</p>
                        <p className="text-gray-500">{customerEmail}</p>
                        <p className="text-gray-500">{customerPhone}</p>
                      </td>
                      <td className="max-w-md px-4 py-3 text-gray-600">
                        {inquiry.message ?? inquiry.title ?? "No message"}
                      </td>
                      <td className="px-4 py-3 capitalize">{inquiry.status}</td>
                      <td className="space-x-2 px-4 py-3">
                        {["pending", "contacted", "closed"].map((status) => (
                          <button
                            className={`rounded-md px-3 py-2 text-sm font-semibold ${
                              inquiry.status === status
                                ? "bg-red-600 text-white"
                                : "border border-gray-300 text-gray-700"
                            }`}
                            key={status}
                            onClick={() =>
                              runAction("Property enquiry status updated.", () =>
                                authenticatedRequest({
                                  data: { status },
                                  method: "PATCH",
                                  url: `/admin/inquiries/properties/${inquiry.id}/status`,
                                }).then(() => undefined),
                              )
                            }
                            type="button"
                          >
                            {status}
                          </button>
                        ))}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                    No property enquiries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MasterForm({ children, onSubmit }: { children: React.ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="mt-8 grid gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 md:grid-cols-4" onSubmit={onSubmit}>{children}<button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white" type="submit"><FaCheck size={13} />Save</button></form>;
}

function StatesPanel({ onSubmit, runAction, states }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; runAction: (message: string, action: () => Promise<void>) => Promise<void>; states: StateItem[] }) {
  return <><MasterForm onSubmit={onSubmit}><input className="h-11 rounded-md border px-3" name="name" placeholder="State name" required /><input className="h-11 rounded-md border px-3" name="code" placeholder="Code" /><select className="h-11 rounded-md border px-3" name="status"><option value="1">Active</option><option value="0">Inactive</option></select></MasterForm><SimpleTable items={states} nameKey="name" onDelete={(id) => runAction("State deleted.", () => authenticatedRequest({ method: "DELETE", url: `/admin/master/states/${id}` }).then(() => undefined))} onToggle={(item) => runAction("State status updated.", () => authenticatedRequest({ data: { country_id: item.country_id ?? 1, name: item.name, code: item.code, status: item.status ? 0 : 1 }, method: "PATCH", url: `/admin/master/states/${item.id}` }).then(() => undefined))} /></>;
}

function CitiesPanel({ cities, onSubmit, runAction, states }: { cities: CityItem[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; runAction: (message: string, action: () => Promise<void>) => Promise<void>; states: StateItem[] }) {
  return <><MasterForm onSubmit={onSubmit}><select className="h-11 rounded-md border px-3" name="state_id" required><option value="">State</option>{states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}</select><input className="h-11 rounded-md border px-3" name="name" placeholder="City name" required /><select className="h-11 rounded-md border px-3" name="status"><option value="1">Active</option><option value="0">Inactive</option></select></MasterForm><SimpleTable items={cities} nameKey="name" onDelete={(id) => runAction("City deleted.", () => authenticatedRequest({ method: "DELETE", url: `/admin/master/cities/${id}` }).then(() => undefined))} onToggle={(item) => runAction("City status updated.", () => authenticatedRequest({ data: { state_id: item.state_id, name: item.name, status: item.status ? 0 : 1 }, method: "PATCH", url: `/admin/master/cities/${item.id}` }).then(() => undefined))} /></>;
}

function CategoriesPanel({ categories, onSubmit, runAction }: { categories: CategoryItem[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; runAction: (message: string, action: () => Promise<void>) => Promise<void> }) {
  return <><MasterForm onSubmit={onSubmit}><input className="h-11 rounded-md border px-3" name="name" placeholder="Category name" required /><input className="h-11 rounded-md border px-3" name="slug" placeholder="Slug optional" /><select className="h-11 rounded-md border px-3" name="status"><option value="1">Active</option><option value="0">Inactive</option></select></MasterForm><SimpleTable items={categories} nameKey="name" onDelete={(id) => runAction("Category deleted.", () => authenticatedRequest({ method: "DELETE", url: `/admin/master/categories/${id}` }).then(() => undefined))} onToggle={(item) => runAction("Category status updated.", () => authenticatedRequest({ data: { name: item.name, slug: item.slug, status: item.status ? 0 : 1 }, method: "PATCH", url: `/admin/master/categories/${item.id}` }).then(() => undefined))} /></>;
}

function PropertyTypesPanel({ onSubmit, propertyTypes, runAction }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; propertyTypes: PropertyTypeItem[]; runAction: (message: string, action: () => Promise<void>) => Promise<void> }) {
  return <><MasterForm onSubmit={onSubmit}><input className="h-11 rounded-md border px-3" name="name" placeholder="Type name" required /><select className="h-11 rounded-md border px-3" name="property_group"><option value="flat">Flat</option><option value="land">Land</option><option value="commercial">Commercial</option></select><select className="h-11 rounded-md border px-3" name="status"><option value="1">Active</option><option value="0">Inactive</option></select></MasterForm><SimpleTable items={propertyTypes} nameKey="name" onDelete={(id) => runAction("Property type deleted.", () => authenticatedRequest({ method: "DELETE", url: `/admin/master/property-types/${id}` }).then(() => undefined))} onToggle={(item) => runAction("Property type status updated.", () => authenticatedRequest({ data: { name: item.name, slug: item.slug, property_group: item.property_group, status: item.status ? 0 : 1 }, method: "PATCH", url: `/admin/master/property-types/${item.id}` }).then(() => undefined))} /></>;
}

function SimpleTable<T extends { id: number; status?: number | boolean }>({ items, nameKey, onDelete, onToggle }: { items: T[]; nameKey: keyof T; onDelete: (id: number) => void; onToggle: (item: T) => void }) {
  return <div className="mt-5 overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200"><table className="w-full text-left text-sm"><thead className="bg-gray-100 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{items.map((item) => <tr className="border-t border-gray-100" key={item.id}><td className="px-4 py-3 font-semibold text-gray-950">{String(item[nameKey])}</td><td className="px-4 py-3">{item.status ? "Active" : "Inactive"}</td><td className="space-x-2 px-4 py-3"><button className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700" onClick={() => onToggle(item)} type="button">{item.status ? "Inactive" : "Active"}</button><button className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => onDelete(item.id)} type="button"><FaTrash size={13} />Delete</button></td></tr>)}</tbody></table></div>;
}
