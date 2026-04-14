// src/components/AppShell.tsx
import React from "react";

export function useAppShell() {
  // Example hook logic, can be customized as needed
  return {
    shellClass: "app-shell"
  };
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell">{children}</div>;
}
