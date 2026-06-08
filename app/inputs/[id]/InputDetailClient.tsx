"use client";

import React from "react";

type InputDetailClientProps = {
  id: string;
};

export default function InputDetailClient({ id }: InputDetailClientProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-green-800">Input Details</h1>
      <p className="mt-3 text-slate-700">Input ID: {id}</p>
    </main>
  );
}
