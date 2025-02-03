import axios from "axios";

const API_KEY = "AIzaSyB2hipu7Y0FJNzEOGryGPpRcK5DaiXCTco";

export const getCoordinates = async (address) => {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
            address,
            key: API_KEY,
        },
    });
    return response.data.results[0].geometry.location;
};
