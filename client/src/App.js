import React, { useState, useEffect } from "react";
import MapComponent from "./components/MapComponent";
import Canvas3D from "./components/Canvas3D";
import axios from "axios";
import './App.css'; 

function App() {
  const [textureUrl, setTextureUrl] = useState("");
  const [savedCaptures, setSavedCaptures] = useState([]);
  const [topCaptures, setTopCaptures] = useState([]);

  const handleCapture = async (url) => {
    setTextureUrl(url);
    try {
      await axios.post("http://localhost:5000/api/captures", {
        imageUrl: url,
        center: { lat: 40.7128, lng: -74.0060 },
      });
      fetchCaptures();
    } catch (error) {
      console.error("Error saving capture:", error);
    }
  };

  const fetchCaptures = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/captures");
      setSavedCaptures(response.data);
    } catch (error) {
      console.error("Error fetching captures:", error);
    }
  };

  const fetchTopCaptures = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/top-captures");
      setTopCaptures(response.data);
    } catch (error) {
      console.error("Error fetching top captures:", error);
    }
  };

  useEffect(() => {
    fetchCaptures();
    fetchTopCaptures(); // Fetch top three captures
  }, []);

  return (
    <div className="app-container">
      <div className="map-fullscreen">
        <MapComponent onCapture={handleCapture} />
        {textureUrl && (
          <div className="canvas-overlay">
            <Canvas3D textureUrl={textureUrl} />
          </div>
        )}
      </div>

      <div className="saved-captures-section">
        <h2>Saved Captures</h2>
        <ul className="captures-list">
          {savedCaptures.map((capture) => (
            <li key={capture._id} className="capture-item" onClick={() => setTextureUrl(capture.imageUrl)}>
              <p>Lat: {capture.center.lat}, Lng: {capture.center.lng}</p>
              <img src={capture.imageUrl} alt="Map capture" className="capture-img" />
            </li>
          ))}
        </ul>
      </div>

      <div className="top-captures-section">
        <h2>Top Captured Regions</h2>
        <ul>
          {topCaptures.map((capture, index) => (
            <li key={index}>
              Lat: {capture._id.lat}, Lng: {capture._id.lng}, Captures: {capture.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
