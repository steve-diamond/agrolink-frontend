const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL");
}



type GetOptions = {
  params?: Record<string, string | number | boolean | undefined | null>;
};


const API = {
  async get<R = unknown>(endpoint: string, options?: GetOptions): Promise<R> {
    let url = `${API_URL}${endpoint}`;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("API GET failed");
    return res.json();
  },

  async post<T, R = unknown>(endpoint: string, data: T): Promise<R> {
    const res = await fetch(`${API_URL}${endpoint}` , {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("API POST failed");
    return res.json();
  }
};
export default API;
