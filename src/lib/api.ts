const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL");
}

const API = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error("API GET failed");
    return res.json();
  },

  post: async <T = unknown>(endpoint: string, data: T) => {
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
