const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
};

async function request(path: string, options: RequestOptions = {}) {
  const { method = "GET", body } = options;

  const response = await fetch(`${baseURL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || "Request failed");
  }

  return { data };
}

export const api = {
  get: (path: string) => request(path, { method: "GET" }),
  post: (path: string, body: unknown) => request(path, { method: "POST", body }),
  patch: (path: string, body: unknown) => request(path, { method: "PATCH", body }),
  put: (path: string, body: unknown) => request(path, { method: "PUT", body }),
  delete: (path: string) => request(path, { method: "DELETE" }),
};

export default api;
