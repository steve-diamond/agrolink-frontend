const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL");
}


const API = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error("API GET failed");
    return res.json() as Promise<T>;
  },

  post: async <T, R>(endpoint: string, data: T): Promise<R> => {
    const res = await fetch(`${API_URL}${endpoint}` , {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("API POST failed");
    return res.json() as Promise<R>;
  }
};

export default API;
