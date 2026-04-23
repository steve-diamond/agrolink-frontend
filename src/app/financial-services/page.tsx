import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function FinancialServicesPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.get("/financial-services/info")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Financial Services Page</h1>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
