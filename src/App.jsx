import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import DividendTracker from "./DividendTracker";
import Portfolio from "./Portfolio";
import { auth, signOut } from "./firebase";
import { toast} from "react-toastify";


function App() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
   useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser); // Update state when user logs in or out
      });
      return () => unsubscribe(); // Cleanup on unmount
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
    <Router>
      <Routes>
        <Route path="/" element={<DividendTracker user = {user} setUser = {setUser} showModal = {showModal} setShowModal = {setShowModal} handleLogout = {handleLogout}/>} />
        <Route path="/portfolio" element={<Portfolio  user = {user} setUser = {setUser} showModal = {showModal} setShowModal = {setShowModal} handleLogout = {handleLogout}/>}/>
      </Routes>
    </Router>
  );
}

export default App;
