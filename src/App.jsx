import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Decoder from "./components/decoder";
import Encoder from "./components/encoder";

const RedirectWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname !== "/jwt-decoder" &&
      location.pathname !== "/jwt-encoder" &&
      location.pathname !== "/home"
    ) {
      window.location.replace("/jwt-decoder");
    }
  }, [location]);

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <RedirectWrapper>
        <Routes>
          <Route path="/jwt-decoder" element={<Decoder />} />
          <Route path="/home" element={<Decoder />} />
          <Route path="/jwt-encoder" element={<Encoder />} />
          <Route path="*" element={<Navigate to="/jwt-decoder" />} />
        </Routes>
      </RedirectWrapper>
    </BrowserRouter>
  );
};

export default App;
