import AdminResetPasswordClient from "./ResetPasswordClient";

type AdminResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function AdminResetPasswordPage({ searchParams }: AdminResetPasswordPageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const token = typeof resolvedSearchParams.token === "string" ? resolvedSearchParams.token : "";
  return <AdminResetPasswordClient token={token} />;
}
