import Decoder from "./components/decoder";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {["/", "/jwt-decoder", "/home"].map((path, i) => (
            <Route
              key={i}
              path={path}
              element={
                  <Decoder />
              }
            />
          ))}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
