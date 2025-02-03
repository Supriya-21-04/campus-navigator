from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import json_util
import json

app = Flask(__name__)
CORS(app)
# CORS(app, resources={r"/api/*": {"origins": "*"}})
# MongoDB URI and configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/campus_navigator"
mongo = PyMongo(app)



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
            {"name": 1, "coordinates": 1, "_id": 0}
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
        
        # Update the search count for the location
        result = mongo.db.locations.update_one(
            {"name": place_name},
            {"$inc": {"search_count": 1}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Location not found"}), 404
            
        if result.modified_count == 1:
            return jsonify({"message": "Search count updated successfully"}), 200
        else:
            return jsonify({"error": "Failed to update search count"}), 500
            
    except Exception as e:
        print(f"Error in increment_search_count: {str(e)}")
        return jsonify({"error": "Server error"}), 500


# Add this new endpoint to your main.py
@app.route('/api/top-places', methods=['GET'])
def get_top_places():
    try:
        # Find top 5 places sorted by search_count in descending order
        top_places = mongo.db.locations.find(
            {},
            {"name": 1, "coordinates": 1, "search_count": 1, "_id": 0}
        ).sort("search_count", -1).limit(5)
        
        # Convert cursor to list
        top_places_list = list(top_places)
        
        return jsonify(top_places_list)
    except Exception as e:
        print(f"Error fetching top places: {str(e)}")
        return jsonify({"error": "Failed to fetch top places"}), 500
    
    
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)