"use client";
import React, { useState } from "react";

export default function FarmerInvestmentUpdates() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 4));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Posting farm updates is not enabled yet. Connect the investment updates backend first.");
  };

  return (
    <main className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-800">Post Farm Update</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 flex flex-col gap-4">
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
        <label htmlFor="update-photos" className="text-sm font-medium text-gray-700">Upload photos</label>
        <input
          id="update-photos"
          type="file"
          accept="image/*"
          multiple
          aria-label="Upload update photos"
          onChange={handlePhotoChange}
          className="border rounded px-3 py-2"
        />
        <div className="flex gap-2 flex-wrap">
          {photos.map((file, i) => (
            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{file.name}</span>
          ))}
        </div>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded">
          Post Update
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}

