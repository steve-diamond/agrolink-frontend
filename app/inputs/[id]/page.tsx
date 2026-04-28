"use client";
import React, { useEffect, useState } from "react";

interface PageProps {
  params?: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const [id, setId] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    async function resolveParams() {
      if (!params) {
        setId("");
      } else {
        const resolved = await params;
        if (!cancelled && resolved && typeof resolved.id === "string") {
          setId(resolved.id);
        } else {
          setId("");
        }
      }
    }
    resolveParams();
    return () => { cancelled = true; };
  }, [params]);
  return (
    <div>
      <h1>Input Details</h1>
      <p>ID: {id}</p>
    </div>
  );
}
