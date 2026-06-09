"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import API from "@services/api";

type InvestmentUpdateRecord = {
  _id: string;
  title: string;
  body: string;
  photo_urls?: string[];
  created_at?: string;
};

function FarmerInvestmentUpdatesContent() {
  const searchParams = useSearchParams();
  const campaignIdFromQuery = useMemo(() => searchParams.get("campaignId") || "", [searchParams]);

  const [campaignId, setCampaignId] = useState(campaignIdFromQuery);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photoUrlsInput, setPhotoUrlsInput] = useState("");
  const [updates, setUpdates] = useState<InvestmentUpdateRecord[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setCampaignId(campaignIdFromQuery);
  }, [campaignIdFromQuery]);

  useEffect(() => {
    const fetchUpdates = async () => {
      if (!campaignId.trim()) {
        setUpdates([]);
        return;
      }

      try {
        setLoadingUpdates(true);
        setError("");

        const response = await API.get<{ data?: { updates?: InvestmentUpdateRecord[] } }>(
          "/api/investment-updates",
          { params: { campaignId: campaignId.trim() } }
        );

        setUpdates(Array.isArray(response?.data?.updates) ? response.data.updates : []);
      } catch (err) {
        setUpdates([]);
        setError(err instanceof Error ? err.message : "Failed to load updates.");
      } finally {
        setLoadingUpdates(false);
      }
    };

    void fetchUpdates();
  }, [campaignId]);

  const parsedPhotoUrls = photoUrlsInput
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignId.trim()) {
      setError("Campaign ID is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await API.post("/api/investment-updates", {
        campaignId: campaignId.trim(),
        title: title.trim(),
        body: body.trim(),
        photoUrls: parsedPhotoUrls,
      });

      setSuccess("Update posted successfully.");
      setTitle("");
      setBody("");
      setPhotoUrlsInput("");

      const refresh = await API.get<{ data?: { updates?: InvestmentUpdateRecord[] } }>(
        "/api/investment-updates",
        { params: { campaignId: campaignId.trim() } }
      );
      setUpdates(Array.isArray(refresh?.data?.updates) ? refresh.data.updates : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post update.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold text-green-800">Post Farm Update</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 flex flex-col gap-4">
        <label htmlFor="campaign-id" className="text-sm font-medium text-gray-700">Campaign ID</label>
        <input
          id="campaign-id"
          type="text"
          className="border rounded px-3 py-2"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          required
        />
        <label htmlFor="update-title" className="text-sm font-medium text-gray-700">Update title</label>
        <input
          id="update-title"
          type="text"
          placeholder="Title"
          className="border rounded px-3 py-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <label htmlFor="update-body" className="text-sm font-medium text-gray-700">Update details</label>
        <textarea
          id="update-body"
          placeholder="Update text"
          className="border rounded px-3 py-2 min-h-25"
          value={body}
          onChange={e => setBody(e.target.value)}
          required
        />
        <label htmlFor="update-photos" className="text-sm font-medium text-gray-700">Photo URLs (comma-separated, optional)</label>
        <input
          id="update-photos"
          type="text"
          placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
          value={photoUrlsInput}
          onChange={(e) => setPhotoUrlsInput(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-2 rounded"
        >
          {submitting ? "Posting..." : "Post Update"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
      </form>

      <section className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Updates</h2>
        {loadingUpdates ? <p className="text-sm text-gray-500">Loading updates...</p> : null}
        {!loadingUpdates && updates.length === 0 ? (
          <p className="text-sm text-gray-500">No updates found for this campaign yet.</p>
        ) : null}
        {!loadingUpdates && updates.length > 0 ? (
          <ul className="space-y-4">
            {updates.map((update) => (
              <li key={update._id} className="border rounded p-4">
                <p className="font-semibold text-gray-900">{update.title}</p>
                <p className="text-sm text-gray-600 mt-1">{update.body}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {update.created_at ? new Date(update.created_at).toLocaleString() : "Just now"}
                </p>
                {Array.isArray(update.photo_urls) && update.photo_urls.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {update.photo_urls.map((url) => (
                      <span key={url} className="text-xs rounded bg-gray-100 px-2 py-1 text-gray-700">{url}</span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}

export default function FarmerInvestmentUpdates() {
  return (
    <Suspense fallback={<main className="max-w-3xl mx-auto py-8"><p className="text-sm text-gray-500">Loading...</p></main>}>
      <FarmerInvestmentUpdatesContent />
    </Suspense>
  );
}

