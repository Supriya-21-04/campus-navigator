

// import React, { useState, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom"; // Add this import
// import "./Search.css";

// const Search = ({ onPlaceSelected }) => {
//   const [query, setQuery] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const debounceTimer = useRef(null);
//   const navigate = useNavigate(); // Add this hook

//   const handleInputChange = async (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     setError(null);

//     if (debounceTimer.current) {
//       clearTimeout(debounceTimer.current);
//     }

//     if (!value.trim()) {
//       setSuggestions([]);
//       return;
//     }

//     debounceTimer.current = setTimeout(async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(`http://localhost:5001/api/search?q=${encodeURIComponent(value.trim())}`);
        
//         if (Array.isArray(response.data)) {
//           setSuggestions(response.data.filter(location => 
//             location.name && 
//             Array.isArray(location.coordinates) && 
//             location.coordinates.length === 2
//           ));
//         } else {
//           console.error('Unexpected response format:', response.data);
//           setSuggestions([]);
//         }
//       } catch (error) {
//         console.error('Error fetching suggestions:', error);
//         setError('Failed to fetch suggestions. Please try again.');
//         setSuggestions([]);
//       } finally {
//         setIsLoading(false);
//       }
//     }, 300);
//   };

//   const handleSelect = async (location) => {
//     if (!location || !location.name || !location.coordinates) {
//       console.error('Invalid location data:', location);
//       return;
//     }

//     setQuery(location.name);
//     setSuggestions([]);

//     try {
//       // Increment search count
//       await axios.post("http://localhost:5001/api/search", {
//         placeName: location.name
//       });

//       // Pass coordinates and full location data to parent component
//       onPlaceSelected(location.coordinates, location);
      
//       // Add navigation to map page
//       navigate("/map");
//     } catch (error) {
//       console.error('Error updating search count:', error);
//       // Continue with navigation even if search count update fails
//       onPlaceSelected(location.coordinates, location);
//       navigate("/map");
//     }
//   };

//   return (
//     <div className="search-container">
//       <div className="search-input-wrapper">
//         <input
//           type="text"
//           value={query}
//           onChange={handleInputChange}
//           placeholder="Search for a location..."
//           className="search-input"
//           autoComplete="off"
//         />
//         {isLoading && <div className="loading-spinner" />}
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {suggestions.length > 0 && (
//         <ul className="suggestions-list">
//           {suggestions.map((place, index) => (
//             <li 
//               key={`${place.name}-${index}`}
//               onClick={() => handleSelect(place)}
//               className="suggestion-item"
//             >
//               {place.name}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Search;

import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Search.css";

const Search = ({ onPlaceSelected, updateTopPlaces }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5001/api/search?q=${encodeURIComponent(value.trim())}`
        );

        if (Array.isArray(response.data)) {
          setSuggestions(
            response.data.filter(
              (location) =>
                location.name &&
                Array.isArray(location.coordinates) &&
                location.coordinates.length === 2
            )
          );
        } else {
          console.error("Unexpected response format:", response.data);
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError("Failed to fetch suggestions. Please try again.");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelect = async (location) => {
    if (!location || !location.name || !location.coordinates) {
      console.error("Invalid location data:", location);
      return;
    }

    setQuery(location.name);
    setSuggestions([]);

    try {
      await axios.post("http://localhost:5001/api/search", {
        placeName: location.name,
      });
      
      // Update top places immediately after successful search
      await updateTopPlaces();
      
      onPlaceSelected(location.coordinates, location);
      navigate("/map");
    } catch (error) {
      console.error("Error updating search count:", error);
      onPlaceSelected(location.coordinates, location);
      navigate("/map");
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