import Decoder from "./components/decoder";
import Encoder from "./components/encoder";
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
          <Route path="/jwt-encoder" element={<Encoder />}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
