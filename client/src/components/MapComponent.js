import React, { useState} from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import axios from 'axios';


const mapContainerStyle = {
  width: "100%",
  height: "50vh",
};

const center = {
  lat: 37.7749, // Defaulting to San Francisco
  lng: -122.4194,
};

const MapComponent = ({ onCapture }) => {
  const [map, setMap] = useState(null);

  const onLoad = (map) => {
    setMap(map);
  };

  const handleCapture = async () => {
    if (map) {
      const center = map.getCenter();
      const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat()},${center.lng()}&zoom=15&size=600x300&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
  
      try {
        const response = await axios.post('http://localhost:5000/api/captures', {
          imageUrl,
          center: {
            lat: center.lat(),
            lng: center.lng(),
          },
        });
        console.log("Capture saved:", response.data);
      } catch (error) {
        console.error("Error saving capture:", error);
      }
    }
  };
  

  return (
    <div>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
        />
      </LoadScript>
      <button onClick={handleCapture}>Capture Map</button>
    </div>
  );
};

export default MapComponent;
