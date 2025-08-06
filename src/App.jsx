import { ToastContainer } from "react-toastify";
import AppRouting from "./routes/AppRouting";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./services/AuthProvider";
import { BookingProvider } from "./context/BookingContext";
import PWARegistration from "./components/PWARegistration";
import OfflineWrapper from "./components/OfflineWrapper";
import GlobalReviewSheet from "./components/GlobalReviewSheet";

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
