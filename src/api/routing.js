import axios from "axios";

const ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

export const getRoute = async (start, end) => {
    const apiKey = process.env.REACT_APP_ORS_API_KEY;

    try {
        const response = await axios.post(ORS_URL, {
            coordinates: [
                [start.lng, start.lat], // Start coordinates
                [end.lng, end.lat],    // End coordinates
            ],
        }, {
            headers: {
                Authorization: apiKey,
            },
        });

        return response.data.features[0].geometry.coordinates;
    } catch (error) {
        console.error("Error fetching route:", error);
        return [];
    }
};
