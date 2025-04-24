import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import UserContext from "./components/context/UserContext";
import ShopContext from "./components/context/ShopContext";
import ScrollToTop from "./hooks/ScrollToTop";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
      <ScrollToTop />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    <GoogleOAuthProvider clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
      <UserContext>
        <ShopContext>
          <App />
        </ShopContext>
      </UserContext>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
