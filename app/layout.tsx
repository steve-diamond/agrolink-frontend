import "./globals.css";
import NavBar from "@/components/NavBar";
import ClientErrorBoundary from "@/components/ClientErrorBoundary";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientErrorBoundary>
          <NavBar />
          <div style={{ padding: "20px" }}>{children}</div>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
