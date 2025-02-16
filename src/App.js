import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import MapPage from "./Components/MapPage";
import Chatbot from "./Components/chatbot";
import "./App.css";

function App() {
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handlePlaceSelected = (coordinates, location) => {
        setSelectedCoordinates(coordinates);
        setSelectedLocation(location);
    };

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path="/" element={<Navbar onPlaceSelected={handlePlaceSelected} />} />
                    <Route path="/map" element={<MapPage coordinates={selectedCoordinates} locationData={selectedLocation} />} />
                    <Route path="/chat" element={<Chatbot />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;