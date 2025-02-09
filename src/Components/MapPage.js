import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "./MapPage.css";

const MapPage = ({ coordinates, locationData }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [directions, setDirections] = useState([]);
  const [totalDistance, setTotalDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [error, setError] = useState(null);
  const routingMachineRef = useRef(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const destinationMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const speedReadingsRef = useRef([]);
  const lastLocationRef = useRef(null);
  const lastLocationTimeRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const watchPositionIdRef = useRef(null);
  const mapUpdateTimeoutRef = useRef(null);
  const isFirstUpdateRef = useRef(true);



  const [locationImage, setLocationImage] = useState(null);

  const locationOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  };

  const createCustomIcon = (color, text) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="background-color: ${color}; width: 24px; height: 24px; 
                    border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);
                    display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
          ${text}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  const userIcon = createCustomIcon('#4285F4', 'U');
  const destinationIcon = createCustomIcon('#EA4335', 'D');

  const formatDistance = (meters) => {
    if (!meters || isNaN(meters)) return '0 m';
    return meters >= 1000 
      ? `${(meters / 1000).toFixed(1)} km`
      : `${Math.round(meters)} m`;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0 min';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const calculateSpeed = (prevLocation, currentLocation, timeDiff) => {
    if (!prevLocation || !currentLocation || !timeDiff) return 0;
    
    const distance = map.distance(
      [prevLocation[0], prevLocation[1]], 
      [currentLocation[0], currentLocation[1]]
    );
    const timeInSeconds = timeDiff / 1000;
    const speedMPS = distance / timeInSeconds;
    const speedKMH = (speedMPS * 3.6).toFixed(1);
    
    return parseFloat(speedKMH);
  };

  const updateAverageSpeed = (newSpeed) => {
    if (newSpeed > 0) {
      speedReadingsRef.current.push(newSpeed);
      
      if (speedReadingsRef.current.length > 5) {
        speedReadingsRef.current.shift();
      }
      
      const avg = speedReadingsRef.current.reduce((a, b) => a + b, 0) / 
                  speedReadingsRef.current.length;
      setAverageSpeed(parseFloat(avg.toFixed(1)));
    }
  };

  const updateRoute = (start, end) => {
    if (!map || !start || !end) return;

    try {
      if (routingControl) {
        map.removeControl(routingControl);
      }

      const baseSpeed = 50;
      const speedFactor = currentSpeed > 0 ? currentSpeed / baseSpeed : 1;

      const newRoutingControl = L.Routing.control({
        waypoints: [
          L.latLng(start[0], start[1]),
          L.latLng(end[0], end[1])
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        addWaypoints: false,
        fitSelectedRoutes: false,
        show: false,
        lineOptions: {
          styles: [{ color: '#4285F4', opacity: 0.8, weight: 6 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        createMarker: () => null,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving',
          parameters: {
            multiplicator: speedFactor
          }
        })
      });

      newRoutingControl.on('routesfound', (e) => {
        const routes = e.routes;
        if (!routes || !routes[0]) return;

        const instructions = routes[0].instructions.map(instruction => ({
          text: instruction.text,
          distance: instruction.distance,
          time: Math.round(instruction.time / speedFactor),
          type: instruction.type
        }));
        
        setDirections(instructions);
        setTotalDistance(routes[0].summary.totalDistance);
        setEstimatedTime(Math.round(routes[0].summary.totalTime / speedFactor));
      });

      newRoutingControl.addTo(map);
      setRoutingControl(newRoutingControl);
      routingMachineRef.current = newRoutingControl;

    } catch (error) {
      console.error('Error updating route:', error);
      setError('Failed to update route. Please try again.');
    }
  };

  const handleLocationUpdate = (position) => {
    const { latitude, longitude, accuracy, speed } = position.coords;
    const newUserLocation = [latitude, longitude];
    const currentTime = Date.now();

    setLocationAccuracy(accuracy);
    setUserLocation(newUserLocation);

    // Update speed calculations
    if (lastLocationRef.current && lastLocationTimeRef.current) {
      const calculatedSpeed = calculateSpeed(
        lastLocationRef.current,
        newUserLocation,
        currentTime - lastLocationTimeRef.current
      );
      
      const newSpeed = speed ? speed * 3.6 : calculatedSpeed;
      setCurrentSpeed(parseFloat(newSpeed.toFixed(1)));
      updateAverageSpeed(newSpeed);
    }

    lastLocationRef.current = newUserLocation;
    lastLocationTimeRef.current = currentTime;

    // Update user marker position with smooth animation
    if (map) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(newUserLocation, {
          icon: userIcon
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng(newUserLocation);
      }

      // Smooth map centering with animation
      if (isFirstUpdateRef.current || map.distance(newUserLocation, map.getCenter()) > 50) {
        map.panTo(newUserLocation, {
          animate: true,
          duration: 1,
          easeLinearity: 0.5
        });
        isFirstUpdateRef.current = false;
      }

      // Update route if navigating
      if (isNavigating && coordinates) {
        // Debounce route updates to prevent too frequent recalculation
        if (mapUpdateTimeoutRef.current) {
          clearTimeout(mapUpdateTimeoutRef.current);
        }
        mapUpdateTimeoutRef.current = setTimeout(() => {
          updateRoute(newUserLocation, coordinates);
        }, 1000); // More frequent updates
      }
    }
  };

  const handleGetDirections = () => {
    setError(null);
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = [latitude, longitude];
          setUserLocation(newLocation);
          setIsNavigating(true);
          startNavigation(newLocation);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Please enable location services.');
        },
        locationOptions
      );
    } else {
      setIsNavigating(true);
      startNavigation(userLocation);
    }
  };

  const startNavigation = (startLocation) => {
    if (coordinates) {
      updateRoute(startLocation, coordinates);

      // Clear any existing watchers
      if (watchPositionIdRef.current) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
      }

      // Start continuous location tracking
      watchPositionIdRef.current = navigator.geolocation.watchPosition(
        handleLocationUpdate,
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Please enable location services.');
          setIsNavigating(false);
        },
        locationOptions
      );

      // Backup interval for consistent updates
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      refreshIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          handleLocationUpdate,
          null,
          locationOptions
        );
      }, 1000);
    }
  };

  useEffect(() => {
    const mapInstance = L.map("map", {
      zoomControl: true,
      attributionControl: true
    }).setView(coordinates || [12.924870, 77.499360], 16);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(mapInstance);

    if (coordinates) {
      destinationMarkerRef.current = L.marker(coordinates, {
        icon: destinationIcon
      }).addTo(mapInstance);
    }

    L.control.scale({ imperial: false }).addTo(mapInstance);

    setMap(mapInstance);

    // Get initial user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
      },
      (error) => {
        console.error('Initial geolocation error:', error);
        setError('Unable to get your location. Please enable location services.');
      },
      locationOptions
    );

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
      if (watchPositionIdRef.current) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (mapUpdateTimeoutRef.current) {
        clearTimeout(mapUpdateTimeoutRef.current);
      }
    };
  }, [coordinates]);

  const getDirectionIcon = (type) => {
    switch (type) {
      case 'SharpLeft':
      case 'SlightLeft':
      case 'Left':
        return '←';
      case 'SharpRight':
      case 'SlightRight':
      case 'Right':
        return '→';
      case 'Straight':
        return '↑';
      case 'DestinationReached':
        return '◉';
      default:
        return '•';
    }
  };

  return (
    <div className="map-page">
      <div id="map" className="map-container"></div>

      {locationData && locationData.image_url && (
        <div className="location-image-container">
          <img 
            src={locationData.image_url} 
            alt={locationData.name || 'Location'}
            className="location-image"
          />
          <h3>{locationData.name}</h3>
        </div>
      )}


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isNavigating && (
        <div className="speed-panel">
          <div className="speed-info">
            <div className="current-speed">
              Current Speed: {currentSpeed} km/h
            </div>
            <div className="average-speed">
              Average Speed: {averageSpeed} km/h
            </div>
            {locationAccuracy && (
              <div className="location-accuracy">
                GPS Accuracy: ±{Math.round(locationAccuracy)}m
              </div>
            )}
          </div>
        </div>
      )}

      {isNavigating && directions.length > 0 && (
        <div className="directions-panel">
          <div className="directions-header">
            <h3>Directions</h3>
            {totalDistance !== null && (
              <div className="route-summary">
                <span className="total-distance">{formatDistance(totalDistance)}</span>
                <span className="separator">•</span>
                <span className="total-time">{formatTime(estimatedTime)}</span>
              </div>
            )}
          </div>
          <div className="directions-list">
            {directions.map((direction, index) => (
              <div key={index} className="direction-item">
                <div className="direction-icon">
                  {getDirectionIcon(direction.type)}
                </div>
                <div className="direction-content">
                  <span className="direction-text">{direction.text}</span>
                  <span className="direction-distance">
                    {formatDistance(direction.distance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button 
        className="get-directions-button"
        onClick={handleGetDirections}
        disabled={!coordinates}
      >
        {isNavigating ? "Recalculate Route" : "Start Navigation"}
      </button>
    </div>
  );
};

export default MapPage;