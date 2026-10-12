import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import PageLoader from "./components/PageLoader";

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />;

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
    </>
  );
};

export default App;
