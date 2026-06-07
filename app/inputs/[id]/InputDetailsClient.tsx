"use client";

import React, { useEffect, useState } from "react";

type InputDetailsClientProps = {
  id: string;
};

export default function InputDetailsClient({ id }: InputDetailsClientProps) {
  const [resolvedId, setResolvedId] = useState<string>(id);

  useEffect(() => {
    setResolvedId(id || "");
  }, [id]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-green-900">Input Details</h1>
      <p className="mt-3 text-slate-700">ID: {resolvedId}</p>
    </main>
  );
}
