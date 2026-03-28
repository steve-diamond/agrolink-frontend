"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";

type ProductForm = {
  name: string;
  price: string;
  quantity: string;
  category: string;
  location: string;
  description: string;
  imageUrl: string;
};

const initialForm: ProductForm = {
  name: "",
  price: "",
  quantity: "",
  category: "",
  location: "",
  description: "",
  imageUrl: "",
};

export default function FarmerUploadPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      if (user?.role !== "farmer") {
        router.replace("/dashboard");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    setCheckingAccess(false);
  }, [router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const rawUser = localStorage.getItem("user") || "{}";
      const user = JSON.parse(rawUser);

      await API.post("/api/products", {
        name: form.name.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        farmer: user.name,
      });

      setForm(initialForm);
      setSuccess("Product uploaded successfully.");
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || requestError?.response?.data?.error || "Failed to upload product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAccess) {
    return <main className="mx-auto max-w-3xl p-6 text-slate-600">Checking farmer access...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-8">
      <section className="rounded-2xl bg-gradient-to-br from-green-800 to-green-600 p-6 text-green-50 shadow-xl shadow-green-900/20">
        <p className="m-0 text-xs uppercase tracking-widest text-green-200">
          Farmer Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Upload a Product</h1>
        <p className="mt-2 max-w-2xl text-sm text-green-100 sm:text-base">
          Add fresh produce to the marketplace with complete listing details so buyers can discover and order quickly.
        </p>
      </section>

      <section className="mt-5 rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg shadow-slate-900/5">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="font-medium text-emerald-900">Product Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Example: Fresh Tomatoes"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="price" className="font-medium text-emerald-900">Price</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="quantity" className="font-medium text-emerald-900">Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="1"
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="category" className="font-medium text-emerald-900">Category</label>
              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Example: Vegetables"
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="location" className="font-medium text-emerald-900">Location</label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Example: Jos, Plateau"
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="font-medium text-emerald-900">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe freshness, source, and any special details"
              rows={4}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="imageUrl" className="font-medium text-emerald-900">Image URL</label>
            <input
              id="imageUrl"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              type="url"
              placeholder="https://example.com/product-image.jpg"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Uploading..." : "Upload Product"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border border-emerald-300 bg-white px-4 py-2 font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}