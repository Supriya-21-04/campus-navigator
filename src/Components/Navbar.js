
// // Navbar.js
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Search from "./Search";
// import "./Navbar.css";
// import logo from "./logo.png";

// const Navbar = ({ onPlaceSelected }) => {
//   const navigate = useNavigate();
//   const [topPlaces, setTopPlaces] = useState([]);

//   useEffect(() => {
//     fetchTopPlaces();
//   }, []);

//   const fetchTopPlaces = async () => {
//     try {
//       const response = await axios.get("http://localhost:5001/api/top-places");
//       setTopPlaces(response.data);
//     } catch (error) {
//       console.error("Error fetching top places:", error);
//     }
//   };

//   const handleTopPlaceClick = (place) => {
//     try {
//       axios.post("http://localhost:5001/api/search", { placeName: place.name });
      
//       // Pass both coordinates and full location data
//       onPlaceSelected(place.coordinates, place);
//       navigate("/map");
//     } catch (error) {
//       console.error("Error updating search count:", error);
//     }
//   };

//   return (
//     <div className="navbar-container">
//       <img src={logo} alt="College Logo" className="logo" />
//       <div className="navbar">
//         <h1>Campus Navigator</h1>
//         <p>Find your way around RVCE campus with ease. Search for buildings, departments, and popular spots instantly.</p>
        
//         <Search onPlaceSelected={onPlaceSelected} />
        
//         <div className="top-places">
//           {topPlaces.map((place) => (
//             <button
//               key={place.name}
//               className="top-place-button"
//               onClick={() => handleTopPlaceClick(place)}
//             >
//               {place.name}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navbar;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Search from "./Search";
import "./Navbar.css";
import logo from "./logo.png";

const Navbar = ({ onPlaceSelected }) => {
  const navigate = useNavigate();
  const [topPlaces, setTopPlaces] = useState([]);

  const fetchTopPlaces = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/top-places");
      setTopPlaces(response.data);
    } catch (error) {
      console.error("Error fetching top places:", error);
    }
  };

  // Fetch top places initially and set up refresh interval
  useEffect(() => {
    fetchTopPlaces();
    
    // Refresh top places every 5 seconds
    const interval = setInterval(fetchTopPlaces, 5000);
    
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

        <div className="top-places">
          {topPlaces.map((place) => (
            <button
              key={place.name}
              className="top-place-button"
              onClick={() => handleTopPlaceClick(place)}
            >
              {place.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;