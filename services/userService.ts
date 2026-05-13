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
  const res = await API.get<{ users?: User[]; data?: User[] | { items?: User[] } }>("/api/admin/users");
  if (Array.isArray(res)) return res as unknown as User[];
  if (Array.isArray((res as unknown as { users?: unknown[] })?.users)) return (res as unknown as { users: User[] }).users;
  if (Array.isArray((res as unknown as User[]))) return res as unknown as User[];
  return [];
}
