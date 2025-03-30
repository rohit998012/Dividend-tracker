import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LoginHeader from "./LoginHeader";
import Banner from "./Banner";
import "./App.css";
import LoginModal from "./LoginModal";

import StockTable from "./StockTable.jsx";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DividendTracker(props) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  

  // Listen for auth state changes
 
  useEffect(() => {
    fetch("http://localhost:5000/stocks") // Fetch from backend
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setStocks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading stock data:", error);
        setLoading(false);
      });
  }, []);
 
  return (
    <>
     <ToastContainer />
          <LoginHeader user={props.user} onLoginClick={() => props.setShowModal(true)} onLogoutClick={props.handleLogout} />
          <LoginModal showModal={props.showModal} onClose={() => props.setShowModal(false)} />
      <Banner />
   
      <div className="container-fluid p-4">
        <div className="row mt-1">
          {/* Left Section - Search & Table */}
         
            
            <div className="table-responsive">
              {loading ? (
                <p>Loading...</p> // Show while waiting for data
              ) : stocks.length === 0 ? (
                <p>No stock data available.</p> // Handle empty data case
              ) : (
               <StockTable stocks = {stocks}/>
              )}
            </div>
          </div>
        
      </div>
    </>
  );
}
