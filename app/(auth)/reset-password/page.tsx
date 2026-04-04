import ResetPasswordClient from "./ResetPasswordClient";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const token = typeof resolvedSearchParams.token === "string" ? resolvedSearchParams.token : "";
  return <ResetPasswordClient token={token} />;
}
