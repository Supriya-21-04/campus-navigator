import React, { useState, useRef } from "react";
import axios from "axios";
import "./Search.css";

const Search = ({ onPlaceSelected }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Clear suggestions if input is empty
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    // Set new timer for debouncing
    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5001/api/search?q=${encodeURIComponent(value.trim())}`);
        
        if (Array.isArray(response.data)) {
          setSuggestions(response.data.filter(location => 
            location.name && 
            Array.isArray(location.coordinates) && 
            location.coordinates.length === 2
          ));
        } else {
          console.error('Unexpected response format:', response.data);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError('Failed to fetch suggestions. Please try again.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelect = async (location) => {
    if (!location || !location.name || !location.coordinates) {
      console.error('Invalid location data:', location);
      return;
    }

    setQuery(location.name);
    setSuggestions([]);

    try {
      // Increment search count
      await axios.post("http://localhost:5001/api/search", {
        placeName: location.name
      });

      // Pass coordinates to parent component
      onPlaceSelected(location.coordinates);
    } catch (error) {
      console.error('Error updating search count:', error);
      // Continue with navigation even if search count update fails
      onPlaceSelected(location.coordinates);
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a location..."
          className="search-input"
          autoComplete="off"
        />
        {isLoading && <div className="loading-spinner" />}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((place, index) => (
            <li 
              key={`${place.name}-${index}`}
              onClick={() => handleSelect(place)}
              className="suggestion-item"
            >
              {place.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;