import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./shared/services";
import { logMobileDebugInfo } from "./utils/mobileDebug.js";

// Log mobile debug info on app start
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(logMobileDebugInfo, 1000);
    });
  } else {
    setTimeout(logMobileDebugInfo, 1000);
  }
}

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  // </StrictMode>
);
