import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Search from "./Search";
import "./Navbar.css";
import logo from "./logo.png";

const Navbar = ({ onPlaceSelected }) => {
  const navigate = useNavigate();
  const [topPlaces, setTopPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTopPlaces = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/api/top-places");
      if (Array.isArray(response.data) && response.data.length > 0) {
        setTopPlaces(response.data);
      } else {
        console.warn("No places returned from API:", response.data);
      }
    } catch (error) {
      console.error("Error fetching top places:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch top places initially
  useEffect(() => {
    fetchTopPlaces();
    
    // Refresh top places periodically
    const interval = setInterval(fetchTopPlaces, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleTopPlaceClick = async (place) => {
    try {
      await axios.post("http://localhost:5001/api/search", {
        placeName: place.name,
      });
      
      // Fetch updated top places after clicking
      await fetchTopPlaces();
      
      onPlaceSelected(place.coordinates, place);
      navigate("/map");
    } catch (error) {
      console.error("Error updating search count:", error);
      // Still navigate even if the update fails
      onPlaceSelected(place.coordinates, place);
      navigate("/map");
    }
  };

  return (
    <div className="navbar-container">
      <img src={logo} alt="College Logo" className="logo" />
      <div className="navbar">
        <h1>Campus Navigator</h1>
        <p>
          Find your way around RVCE campus with ease. Search for buildings,
          departments, and popular spots instantly.
        </p>

        <Search onPlaceSelected={onPlaceSelected} updateTopPlaces={fetchTopPlaces} />
        
        {/* Chatbot Button */}
        <button className="chatbot-button" onClick={() => navigate("/chat")}>
          Open Chatbot
        </button>

        {topPlaces.length > 0 && (
          <div className="top-places-section">
            <h3>Popular Locations</h3>
            <div className="top-places">
              {isLoading ? (
                <span className="loading-text">Loading...</span>
              ) : (
                topPlaces.map((place) => (
                  <button
                    key={place.name}
                    className="top-place-button"
                    onClick={() => handleTopPlaceClick(place)}
                  >
                    {place.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;