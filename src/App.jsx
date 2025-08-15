import { ToastContainer } from "react-toastify";
import AppRouting from "./routes/AppRouting";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./features/authentication";
import { BookingProvider } from "./features/booking";
import { PWARegistration } from "./modules/pwa";
import { OfflineWrapper } from "./modules/pwa";
import { GlobalReviewSheet } from "./shared/components";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <OfflineWrapper>
            <AppRouting />
            <PWARegistration />
            <GlobalReviewSheet />
            <ToastContainer />
            <Toaster 
              position="bottom-right"
              closeButton={true}
              duration={Infinity}
              richColors={true}
            />
          </OfflineWrapper>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
