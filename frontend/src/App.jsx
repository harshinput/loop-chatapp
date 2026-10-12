import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import PageLoader from "./components/PageLoader";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) checkAuth();
    else clearAuth();
  }, [checkAuth, clearAuth, isLoaded, isSignedIn]);

  if (!isLoaded || (isSignedIn && isCheckingAuth)) return <PageLoader />;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={isSignedIn ? <ChatPage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/auth"
          element={!isSignedIn ? <AuthPage /> : <Navigate to="/" />}
        />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
