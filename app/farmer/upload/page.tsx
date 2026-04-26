"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProduct } from "@services/productService";
import { enqueueCreateProduct, flushOfflineQueue, getPendingQueueCount } from "@services/offlineQueue";
import { useLocalizedCopy } from "@services/useLocalizedCopy";
import { getCopy } from "@services/uiCopy";
import { getStoredLanguage } from "@services/uiLanguage";

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
  const { copy } = useLocalizedCopy();
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingOffline, setPendingOffline] = useState(0);

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
    setPendingOffline(getPendingQueueCount());
  }, [router]);

  useEffect(() => {
    const syncQueued = async () => {
      if (!navigator.onLine) {
        return;
      }

      const result = await flushOfflineQueue((payload: ProductForm) => createProduct(payload));
      if (result.processed > 0) {
        const liveCopy = getCopy(getStoredLanguage());
        setSuccess(`${liveCopy.syncedOfflineUploads}: ${result.processed}`);
      }
      setPendingOffline(getPendingQueueCount());
    };

    const onOnline = () => {
      syncQueued().catch(() => undefined);
    };

    window.addEventListener("online", onOnline);
    syncQueued().catch(() => undefined);

    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "imageUrl") {
      setImagePreview(value.trim());
    }
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image file is too large. Please select an image under 2MB.");
      return;
    }

    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, imageUrl: result }));
      setImagePreview(result);
      setSuccess("Image selected successfully. You can now upload the product.");
    };
    reader.onerror = () => {
      setError("Could not read the selected image. Please try another file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
      };

      if (!payload.imageUrl) {
        setError("Please provide an image URL or upload an image file.");
        return;
      }

      if (!navigator.onLine) {
        enqueueCreateProduct(payload);
        setForm(initialForm);
        setImagePreview("");
        setPendingOffline(getPendingQueueCount());
        setSuccess(copy.offlineSaved);
        return;
      }

      await createProduct(payload);

      setForm(initialForm);
      setImagePreview("");
      setSuccess("Product uploaded successfully and is now pending admin approval.");
    } catch (requestError: unknown) {
      let details: unknown = undefined;
      let detailedMessage: unknown = undefined;
      if (typeof requestError === "object" && requestError !== null && "response" in requestError) {
        // @ts-expect-error: dynamic error shape from backend
        details = requestError.response?.data?.details;
        detailedMessage = Array.isArray(details) && details.length > 0 ? details[0] : undefined;
        // @ts-expect-error: dynamic error shape from backend
        setError(
          detailedMessage ||
            // @ts-expect-error: dynamic error shape from backend
            requestError.response?.data?.message ||
            // @ts-expect-error: dynamic error shape from backend
            requestError.response?.data?.error ||
            "Failed to upload product."
        );
      } else {
        setError("Failed to upload product.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAccess) {
    return <main className="mx-auto max-w-3xl p-6 text-slate-600">Checking farmer access...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-8">
      <section className="rounded-2xl bg-linear-to-br from-green-800 to-green-600 p-6 text-green-50 shadow-xl shadow-green-900/20">
        <p className="m-0 text-xs uppercase tracking-widest text-green-200">
          {copy.myFarm}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Upload a Product</h1>
        <p className="mt-2 max-w-2xl text-sm text-green-100 sm:text-base">
          Add fresh produce to the marketplace with complete listing details so buyers can discover and order quickly.
        </p>
        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-green-50">
          Uploaded products remain hidden from buyers until an admin approves them.
        </p>
        {pendingOffline > 0 ? (
          <p className="mt-3 rounded-xl border border-amber-200/80 bg-amber-100/20 px-3 py-2 text-sm text-amber-100">
            {copy.pendingOfflineUploads}: {pendingOffline}
          </p>
        ) : null}
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
            />
            <p className="m-0 text-xs text-slate-500">You can paste an image URL or upload an image file below.</p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="imageFile" className="font-medium text-emerald-900">Upload Image File</label>
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-emerald-200 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-emerald-800 hover:file:bg-emerald-100 focus:ring"
            />
            <p className="m-0 text-xs text-slate-500">Max file size: 2MB. Supported: common image formats.</p>
          </div>

          {imagePreview ? (
            <div className="grid gap-2">
              <p className="m-0 font-medium text-emerald-900">Image Preview</p>
              <Image
                src={imagePreview}
                alt="Selected product preview"
                width={1200}
                height={800}
                unoptimized
                className="h-44 w-full rounded-lg border border-emerald-100 object-cover sm:h-56"
              />
            </div>
          ) : null}

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
              className="btn-primary touch-target disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Uploading..." : "Upload Product"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn-secondary touch-target"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}