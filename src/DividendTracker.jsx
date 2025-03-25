import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LoginHeader from "./LoginHeader";
import Banner from "./Banner";
import "./App.css";
import LoginModal from "./LoginModal";
import { auth, signOut } from "./firebase";
import StockTable from "./StockTable.jsx";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast} from "react-toastify";
export default function DividendTracker() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Update state when user logs in or out
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);
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
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // <-- Clear user state
      toast.success("Logged out successfully!");
    } catch (err) {
      toast.error("Logout failed!", err);
    }
  };
  return (
    <>
     <ToastContainer />
          <LoginHeader user={user} onLoginClick={() => setShowModal(true)} onLogoutClick={handleLogout} />
          <LoginModal showModal={showModal} onClose={() => setShowModal(false)} />
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
