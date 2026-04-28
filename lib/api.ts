import type { ApiResponse } from "../../types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL");
}

const API = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error("API GET failed");
    return res.json() as Promise<ApiResponse<T>>;
  },

  post: async <TReq, TRes>(endpoint: string, data: TReq): Promise<ApiResponse<TRes>> => {
    const res = await fetch(`${API_URL}${endpoint}` , {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("API POST failed");
    return res.json() as Promise<ApiResponse<TRes>>;
  }
};

export default API;
