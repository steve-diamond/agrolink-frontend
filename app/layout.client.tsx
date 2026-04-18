import ClientRootLayout from "./ClientRootLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientRootLayout>{children}</ClientRootLayout>;
}
