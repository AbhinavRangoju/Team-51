import "@testing-library/jest-dom/vitest";

// Unit suite must never touch a live Neon database — force the JSON backend.
delete process.env.DATABASE_URL;
delete process.env["\uFEFFDATABASE_URL"];

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
