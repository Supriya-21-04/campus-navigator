from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import json_util
from datetime import datetime
import logging
from chatbot.chat import chatbot


app = Flask(__name__)
CORS(app)

# MongoDB URI and configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/campus_navigator"
mongo = PyMongo(app)

#just to see in terminal if it is coming
response = chatbot.get_response("HELLO")
print(response)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/chat', methods=['POST'])
def chat():
    try:
        message = request.json.get('message')
        if not message:
            return jsonify({'response': 'Please provide a message.'}), 400
            
        # Get response from chatbot
        response = chatbot.get_response(message)
        logger.info(f"User message: {message}")
        logger.info(f"Bot response: {response}")
        
        return jsonify({'response': str(response)})
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'response': 'Sorry, I encountered an error!'}), 500


@app.route('/api/search', methods=['GET'])
def search_locations():
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify([])
    
    try:
        # Case-insensitive regex pattern to match locations that START with the query
        regex_pattern = {'$regex': f'^{query}', '$options': 'i'}
        
        # Query MongoDB for locations that start with the input
        cursor = mongo.db.locations.find(
            {"name": regex_pattern},
            {"name": 1, "coordinates": 1, "image_url": 1, "_id": 0}
        ).limit(10)
        
        # Convert cursor to list of locations
        locations = list(cursor)
        
        return jsonify(locations)
    
    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({"error": "An error occurred while searching"}), 500

@app.route('/api/search', methods=['POST'])
def increment_search_count():
    try:
        data = request.get_json()
        if not data or 'placeName' not in data:
            return jsonify({"error": "Place name is required"}), 400
        
        place_name = data['placeName']
        
        # First, get the location details
        location = mongo.db.locations.find_one(
            {"name": place_name},
            {"name": 1, "coordinates": 1, "image_url": 1, "_id": 0}
        )
        
        if not location:
            return jsonify({"error": "Location not found"}), 404

        # Update search count in locations collection
        mongo.db.locations.update_one(
            {"name": place_name},
            {"$inc": {"search_count": 1}}
        )
        
        # Add to recent searches collection with timestamp
        mongo.db.recent_searches.insert_one({
            "timestamp": datetime.utcnow(),
            "location": location
        })
        
        # Keep only the most recent 100 searches (to prevent unlimited growth)
        total_searches = mongo.db.recent_searches.count_documents({})
        if total_searches > 100:
            # Find and delete older searches
            oldest_searches = mongo.db.recent_searches.find().sort("timestamp", 1).limit(total_searches - 100)
            old_ids = [doc["_id"] for doc in oldest_searches]
            mongo.db.recent_searches.delete_many({"_id": {"$in": old_ids}})
        
        return jsonify({"message": "Search recorded successfully"}), 200
        
    except Exception as e:
        print(f"Error in increment_search_count: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/top-places', methods=['GET'])
def get_top_places():
    try:
        # Find the 5 most recent unique locations
        pipeline = [
            # Sort by timestamp descending (most recent first)
            {"$sort": {"timestamp": -1}},
            # Group by location name to get unique locations
            {"$group": {
                "_id": "$location.name",
                "firstDoc": {"$first": "$$ROOT"}
            }},
            # Limit to 5 results
            {"$limit": 5},
            # Project the fields we want
            {"$project": {
                "_id": 0,
                "name": "$firstDoc.location.name",
                "coordinates": "$firstDoc.location.coordinates",
                "image_url": "$firstDoc.location.image_url"
            }}
        ]
        
        recent_places = list(mongo.db.recent_searches.aggregate(pipeline))
        return jsonify(recent_places)
    
    except Exception as e:
        print(f"Error fetching top places: {str(e)}")
        return jsonify({"error": "Failed to fetch top places"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)

