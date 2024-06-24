import Decoder from "./components/decoder";
import Encoder from "./components/encoder";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
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
      </Router>
    </>
  );
}

export default App;
