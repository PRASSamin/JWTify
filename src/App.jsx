import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Encoder from './components/encoder'
import Decoder from './components/decoder';

const App = () => {
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname !== "/jwt-decoder" ||
      location.pathname !== "/jwt-encoder" ||
      location.pathname !== "/home"
    ) {
      window.location.replace("/jwt-decoder");
    }
  }, [location]);

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
