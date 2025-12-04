import posthog from 'posthog-js';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./recorder"; // side-effect import for screen recording

// PostHog initialization - runs before React renders
if (typeof window !== "undefined") {
  posthog.init("phx_t1O0BLm28jIK8YdfLAUnnIYwGnXIXaBF86iVyM6tt0S8Wg2", {
    api_host: "https://us.posthog.com",
    session_recording: {
      recordCanvas: true,
    },
    autocapture: true,
    capture_pageview: true,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
