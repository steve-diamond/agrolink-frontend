import API from "../src/services/api";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved?: boolean;
  category?: string;
};

export async function getUsers(): Promise<User[]> {
  const res = await API.get<{ data?: User[] | { users?: User[]; data?: { items?: User[] } } }>("/api/users");
  if (Array.isArray(res.data)) return res.data as User[];
  if (Array.isArray((res.data as { users?: unknown[] })?.users)) return (res.data as { users: User[] }).users;
  if (Array.isArray((res.data as { data?: { items?: unknown[] } })?.data?.items)) return (res.data as { data: { items: User[] } }).data.items;
  return [];
}
