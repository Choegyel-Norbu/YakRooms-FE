import { ToastContainer } from "react-toastify";
import AppRouting from "./routes/AppRouting";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./features/authentication";
import { SubscriptionProvider } from "./features/subscription";
import { PWARegistration } from "./modules/pwa";
import InternetConnectionMonitor from "./shared/components/InternetConnectionMonitor";
import RootPathHandler from "./components/RootPathHandler";
import RatingDialogProvider from "./shared/components/RatingDialogProvider";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <RootPathHandler />
          <AppRouting />
          <PWARegistration />
          <InternetConnectionMonitor />
          <RatingDialogProvider />
          <ToastContainer />
          <Toaster
            position="bottom-right"
            closeButton={true}
            duration={6000}
            richColors={false}
          />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
