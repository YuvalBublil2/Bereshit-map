import React from 'react';
import './App.css';

function App() {




  return (
    <div className="container mt-4">
      <header className="pb-3">
          <div className="row justify-content-between align-items-center">
              <h1 className="text-center">Bereshit Map</h1>
          </div>
      </header>


      <main>
          <div className="input-group mb-3 shadow-sm">
              <span className="input-group-text">Name Location :</span>
              <input id="name_location" type="text" placeholder="Enter location" className="form-control"/>
              <button className="btn btn-primary" onClick="showLocation()">Search</button>
          </div>
          <span id="polygon-number"></span>
          <div id="map" className="p-4 rounded shadow-sm"></div>
      </main>

      <footer className="footer mt-auto py-3">
          <div className="text-center">
              <p className="text-dark">&copy; By Technological Laboratory</p>
          </div>
      </footer>
    </div>
  );
}

export default App;
