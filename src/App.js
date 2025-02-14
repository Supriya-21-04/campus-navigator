// // App.js
// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./Components/Navbar";
// import MapPage from "./Components/MapPage";
// import "./App.css";
// import axios from "axios";

// function App() {
//   const [selectedCoordinates, setSelectedCoordinates] = useState(null);
//   const [selectedLocation, setSelectedLocation] = useState(null);

//   const handlePlaceSelected = (coordinates, locationData) => {
//     setSelectedCoordinates(coordinates);
//     setSelectedLocation(locationData);
//   };

//   return (
//     <Router>
//       <div className="app">
//         <Routes>
//           <Route
//             path="/"
//             element={<Navbar onPlaceSelected={handlePlaceSelected} />}
//           />
//           <Route
//             path="/map"
//             element={<MapPage 
//               coordinates={selectedCoordinates} 
//               locationData={selectedLocation} 
//             />}
//           />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;



//newone which v should use 

// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./Components/Navbar";
// import MapPage from "./Components/MapPage";
// import "./App.css";
// import axios from "axios";

// function Chatbot() {
//     const [message, setMessage] = useState("");
//     const [chat, setChat] = useState([]);

//     const sendMessage = async () => {
//         if (!message.trim()) return;

//         const userMessage = { sender: "user", text: message };
//         setChat([...chat, userMessage]);

//         try {
//             const response = await axios.post("http://127.0.0.1:5000/chat", { message });
//             const botMessage = { sender: "bot", text: response.data.response };
//             setChat([...chat, userMessage, botMessage]);
//         } catch (error) {
//             console.error("Error:", error);
//         }

//         setMessage("");
//     };

//     return (
//         <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
//             <h2>Chatbot</h2>
//             <div style={{ border: "1px solid black", padding: "10px", height: "300px", overflowY: "auto" }}>
//                 {chat.map((msg, index) => (
//                     <p key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
//                         <b>{msg.sender === "user" ? "You" : "Bot"}:</b> {msg.text}
//                     </p>
//                 ))}
//             </div>
//             <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Type a message..."
//             />
//             <button onClick={sendMessage}>Send</button>
//         </div>
//     );
// }

// function App() {
//     const [selectedCoordinates, setSelectedCoordinates] = useState(null);
//     const [selectedLocation, setSelectedLocation] = useState(null);

//     const handlePlaceSelected = (coordinates, location) => {
//         setSelectedCoordinates(coordinates);
//         setSelectedLocation(location);
//     };

//     return (
//         <Router>
//             <div className="app">
//                 <Routes>
//                     <Route path="/" element={<Navbar onPlaceSelected={handlePlaceSelected} />} />
//                     <Route path="/map" element={<MapPage coordinates={selectedCoordinates} locationData={selectedLocation} />} />
//                     <Route path="/chat" element={<Chatbot />} />
//                 </Routes>
//             </div>
//         </Router>
//     );
// }

// export default App;




import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import MapPage from "./Components/MapPage";
import "./App.css";
import axios from "axios";

function Chatbot() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);

    const sendMessage = async (e) => {
        e.preventDefault(); // Prevent form submission
        if (!message.trim()) return;

        const userMessage = { sender: "user", text: message };
        
        try {
            // Update chat immediately with user message
            setChat(prevChat => [...prevChat, userMessage]);
            
            // Send to backend
            const response = await axios.post("http://127.0.0.1:5000/chat", { 
                message: message 
            });
            
            // Add bot response
            const botMessage = { sender: "bot", text: response.data.response };
            setChat(prevChat => [...prevChat, botMessage]);
        } catch (error) {
            console.error("Error:", error);
            // Optionally show error message in chat
            const errorMessage = { sender: "bot", text: "Sorry, I encountered an error!" };
            setChat(prevChat => [...prevChat, errorMessage]);
        }

        setMessage("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage(e);
        }
    };

    return (
        <div className="chatbot-container" style={{
            maxWidth: "500px",
            margin: "20px auto",
            padding: "20px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            borderRadius: "8px"
        }}>
            <h2>Campus Navigator Assistant</h2>
            <div className="chat-messages" style={{
                height: "400px",
                overflowY: "auto",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginBottom: "20px"
            }}>
                {chat.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            textAlign: msg.sender === "user" ? "right" : "left",
                            margin: "10px 0",
                            padding: "8px 12px",
                            backgroundColor: msg.sender === "user" ? "#007bff" : "#e9ecef",
                            color: msg.sender === "user" ? "white" : "black",
                            borderRadius: "12px",
                            maxWidth: "70%",
                            marginLeft: msg.sender === "user" ? "auto" : "0",
                            wordWrap: "break-word"
                        }}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="chat-input" style={{
                display: "flex",
                gap: "10px"
            }}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd"
                    }}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

// Rest of your App component remains the same
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