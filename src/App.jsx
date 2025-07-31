import { ToastContainer } from "react-toastify";
import AppRouting from "./routes/AppRouting";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./services/AuthProvider";
import PWARegistration from "./components/PWARegistration";
import OfflineWrapper from "./components/OfflineWrapper";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OfflineWrapper>
          <AppRouting />
          <PWARegistration />
          <ToastContainer />
          <Toaster 
            position="bottom-left"
            closeButton={true}
            duration={Infinity}
            richColors={true}
          />
        </OfflineWrapper>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
