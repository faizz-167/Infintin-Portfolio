"use client";

/**
 * A failure in the root layout itself. Renders its own document without the
 * site's stylesheet or fonts, so it stays plain: inline styles in the sheet
 * palette (paper ground, graphite ink) and a plain link home, which does a
 * full reload rather than relying on the broken client tree.
 */
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "0 clamp(1rem, 4vw, 4rem)",
          background: "#fafafa",
          color: "#14151a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <title>Something went wrong · Infintin</title>
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: 600 }}>
          This page didn't load
        </h1>
        <p style={{ margin: 0, maxWidth: "60ch", lineHeight: 1.5 }}>
          Something went wrong on our side. Try again, or come back in a moment.
        </p>
        <p style={{ margin: 0, display: "flex", gap: "1.5rem" }}>
          <button type="button" onClick={retry} style={{ font: "inherit" }}>
            Try again
          </button>
          {/* A plain anchor: a full reload, not the broken client router. */}
          <a href="/" style={{ color: "inherit" }}>
            Go to the home page
          </a>
        </p>
      </body>
    </html>
  );
}
