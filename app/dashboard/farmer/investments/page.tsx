"use client";
import React, { useState } from "react";

export default function FarmerInvestmentUpdates() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 4));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to investment_updates and notify investors
    alert("Update posted (demo only)");
  };

  return (
    <main className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-800">Post Farm Update</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title"
          className="border rounded px-3 py-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Update text"
          className="border rounded px-3 py-2 min-h-[100px]"
          value={body}
          onChange={e => setBody(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          multiple
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
      </form>
    </main>
  );
}

