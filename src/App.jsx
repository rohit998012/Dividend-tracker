import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import DividendTracker from "./DividendTracker";
import Portfolio from "./Portfolio";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DividendTracker />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </Router>
  );
}

export default App;
