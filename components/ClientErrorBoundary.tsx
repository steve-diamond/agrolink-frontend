"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ClientErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Client rendering error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ padding: "20px", maxWidth: "720px", margin: "0 auto" }}>
          <h1 style={{ marginBottom: "10px" }}>Something went wrong</h1>
          <p style={{ color: "#64748b", marginBottom: "14px" }}>
            A client-side error occurred while loading this page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}