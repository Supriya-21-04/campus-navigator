import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import MapPage from "./Components/MapPage";
import "./App.css";

function App() {
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);

  const handlePlaceSelected = (coordinates) => {
    setSelectedCoordinates(coordinates);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={<Navbar onPlaceSelected={handlePlaceSelected} />}
          />
          <Route
            path="/map"
            element={<MapPage coordinates={selectedCoordinates} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;



