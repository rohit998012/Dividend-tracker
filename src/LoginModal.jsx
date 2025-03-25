import { useState } from "react";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "./firebase";
import { toast} from "react-toastify";
export default function LoginModal({ showModal, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Google login successful!");
      onClose(); // Close modal after login
    } catch (err) {
      toast.error("Google login failed!");
    }
  };

  // Email/Password Login or Sign-up
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
       toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login successful!");
      }
      onClose(); // Close modal after success
    } catch (err) {
      toast.error("Authentication failed!");
    }
  };

  return (
    <>
      {showModal && <div className="modal-backdrop fade show"></div>}
      <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isSignUp ? "Sign Up" : "Login"}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              

              <form onSubmit={handleEmailAuth}>
                <div className="mb-3">
                  <label>Email</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label>Password</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100">{isSignUp ? "Sign Up" : "Login"}</button>
              </form>
              
              <div className="mt-3 text-center">
              <button className="btn btn-danger w-100 mb-3" onClick={handleGoogleLogin}>
                <i className="bi bi-google"></i> Sign in with Google
              </button>
                <button className="btn btn-link" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                </button>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
