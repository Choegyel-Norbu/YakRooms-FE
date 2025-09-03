import { ToastContainer } from "react-toastify";
import AppRouting from "./routes/AppRouting";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./features/authentication";
import { BookingProvider } from "./features/booking";
import { PWARegistration } from "./modules/pwa";
import { GlobalReviewSheet } from "./shared/components";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <AppRouting />
          <PWARegistration />
          <GlobalReviewSheet />
          <ToastContainer />
          <Toaster
            position="bottom-right"
            closeButton={true}
            duration={6000}
            richColors={true}
          />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
