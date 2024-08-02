import { useEffect } from "react";
import Decoder from "./components/decoder";
import Encoder from "./components/encoder";
import { BrowserRouter, Routes, Route } from "react-router-dom";


function App() {

  useEffect(() => {
    if (location.pathname !== "/jwt-decoder" || location.pathname !== "/jwt-encoder" || location.pathname !== "/home") {
      window.location.replace("/jwt-decoder")
    }
  }, [])
  return (
    <>
      <BrowserRouter>
        <Routes>
          {["/jwt-decoder", "/home"].map((path, i) => (
            <Route
              key={i}
              path={path}
              element={
                <Decoder />
              }
            />
          ))}
          <Route path="/jwt-encoder" element={<Encoder />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
