import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./recorder"; // side-effect import for screen recording
import posthog from 'posthog-js'

posthog.init('phc_lu46ALUWXJCodQCUIvtQYNSV8LF8Znuqsi8bIQlRbe7', {
  api_host: 'https://app.posthog.com',
})

createRoot(document.getElementById("root")!).render(<App />);
