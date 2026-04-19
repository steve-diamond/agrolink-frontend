import API from "./api";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved?: boolean;
  category?: string;
};

export async function getUsers(): Promise<User[]> {
  const res = await API.get("/api/users");
  if (Array.isArray(res.data)) return res.data as User[];
  if (Array.isArray(res.data?.users)) return res.data.users as User[];
  if (Array.isArray(res.data?.data?.items)) return res.data.data.items as User[];
  return [];
}
