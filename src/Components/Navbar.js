import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Search from "./Search";
import "./Navbar.css";  // Import the CSS file
import logo from  "./logo.png";  // Ensure logo path is correct

const Navbar = ({ onPlaceSelected }) => {
  const navigate = useNavigate();
  const [topPlaces, setTopPlaces] = useState([]);

  useEffect(() => {
    fetchTopPlaces();
  }, []);

  const fetchTopPlaces = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/top-places");
      setTopPlaces(response.data);
    } catch (error) {
      console.error("Error fetching top places:", error);
    }
  };

  const handlePlaceSelected = (coordinates) => {
    onPlaceSelected(coordinates);
    navigate("/map");
  };

  const handleTopPlaceClick = (place) => {
    try {
      axios.post("http://localhost:5001/api/search", { placeName: place.name });
    } catch (error) {
      console.error("Error updating search count:", error);
    }

    handlePlaceSelected(place.coordinates);
  };

  return (
    <div className="navbar-container">
      <img src={logo} alt="College Logo" className="logo" />  
      <div className="navbar">
        <h1>Campus Navigator</h1>
        <p>Find your way around RVCE campus with ease. Search for buildings, departments, and popular spots instantly.</p>

        <Search onPlaceSelected={handlePlaceSelected} />

        <div className="top-places">
          {topPlaces.map((place) => (
            <button
              key={place.id}
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




// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./Navbar.css";  
// import logo from "./logo.png";  

// const Navbar = ({ onPlaceSelected }) => {
//   const navigate = useNavigate();
//   const [topPlaces, setTopPlaces] = useState([]);
//   const [allPlaces, setAllPlaces] = useState([]); // Stores all locations from MongoDB
//   const [searchTerm, setSearchTerm] = useState(""); // Stores user input
//   const [filteredPlaces, setFilteredPlaces] = useState([]); // Stores matched locations

//   useEffect(() => {
//     fetchAllPlaces();
//     fetchTopPlaces();
//   }, []);

//   // Fetch all locations from MongoDB
//   const fetchAllPlaces = async () => {
//     try {
//       const response = await axios.get("http://localhost:5001/api/all-places");
//       setAllPlaces(response.data);
//     } catch (error) {
//       console.error("Error fetching places:", error);
//     }
//   };

//   // Fetch top searched places
//   const fetchTopPlaces = async () => {
//     try {
//       const response = await axios.get("http://localhost:5001/api/top-places");
//       setTopPlaces(response.data);
//     } catch (error) {
//       console.error("Error fetching top places:", error);
//     }
//   };

//   // Handle user input and filter locations dynamically
//   const handleSearchChange = (event) => {
//     const value = event.target.value;
//     setSearchTerm(value);

//     if (value) {
//       const filtered = allPlaces.filter((place) =>
//         place.name.toLowerCase().startsWith(value.toLowerCase())
//       );
//       setFilteredPlaces(filtered);
//     } else {
//       setFilteredPlaces([]);
//     }
//   };

//   // Handle location selection from the dropdown
//   const handlePlaceSelected = (place) => {
//     setSearchTerm(place.name);
//     setFilteredPlaces([]); // Hide dropdown after selection
//     onPlaceSelected(place.coordinates);
//     navigate("/map");
//   };

//   return (
//     <div className="navbar-container">
//       <img src={logo} alt="College Logo" className="logo" />  
//       <div className="navbar">
//         <h1>Campus Navigator</h1>
//         <p>Find your way around RVCE campus with ease. Search for buildings, departments, and popular spots instantly.</p>

//         {/* Search Input */}
//         <div className="search-container">
//           <input
//             type="text"
//             placeholder="Search for a location..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className="search-input"
//           />
//           {/* Dropdown for filtered locations */}
//           {filteredPlaces.length > 0 && (
//             <div className="dropdown">
//               {filteredPlaces.map((place) => (
//                 <div
//                   key={place._id}
//                   className="dropdown-item"
//                   onClick={() => handlePlaceSelected(place)}
//                 >
//                   {place.name}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Top searched places */}
//         <div className="top-places">
//           {topPlaces.map((place) => (
//             <button
//               key={place._id}
//               className="top-place-button"
//               onClick={() => handlePlaceSelected(place)}
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
