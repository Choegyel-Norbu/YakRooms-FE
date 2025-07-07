import { ToastContainer } from "react-toastify";
import AppRouting from "./routes/AppRouting";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./services/AuthProvider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouting />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
