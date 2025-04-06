import React, { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "./firebase";
import { ToastContainer } from "react-toastify";
import { app } from "./firebase"; 
import LoginHeader from "./LoginHeader";
import LoginModal from "./LoginModal";

const Portfolio = (props) => {
    const db = getFirestore(app);
    const [stocks, setStocks] = useState([]);
    const [activePortfolio, setActivePortfolio] = useState(0);
    const [portfolios, setPortfolios] = useState([
      { name: "Portfolio 1", stocks: [] },
      { name: "Portfolio 2", stocks: [] },
      { name: "Portfolio 3", stocks: [] }
    ]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const stocksPerPage = 7;
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    // Add click outside handler
    useEffect(() => {
      function handleClickOutside(event) {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
          setShowDropdown(false);
        }
      }
      
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Show dropdown when search has results
    useEffect(() => {
      setShowDropdown(filteredStocks.length > 0);
    }, [filteredStocks]);

    // Consolidated useEffect for fetching portfolios
    useEffect(() => {
      const fetchPortfolios = async () => {
        try {
          const user = auth.currentUser;
          const userId = user ? user.uid : "guest";
          const userDocRef = doc(db, "users", userId);
          const docSnap = await getDoc(userDocRef);
      
          if (docSnap.exists() && docSnap.data().portfolios) {
            setPortfolios(docSnap.data().portfolios);
          } else {
            // Set default portfolios if none exist
            const defaultPortfolios = [
              { name: "Portfolio 1", stocks: [] },
              { name: "Portfolio 2", stocks: [] },
              { name: "Portfolio 3", stocks: [] }
            ];
            setPortfolios(defaultPortfolios);
            // Save the default portfolios for this user
            if (user) {
              await setDoc(userDocRef, { portfolios: defaultPortfolios });
            }
          }
        } catch (error) {
          console.error("Error loading portfolios:", error);
        }
      };
      
      fetchPortfolios();
    }, [auth.currentUser]); // Re-fetch when user changes

    // Fetch stock data
    useEffect(() => {
      fetch("http://localhost:5000/stocks")
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch stocks");
          return response.json();
        })
        .then((data) => setStocks(data))
        .catch((error) => console.error("Error fetching stocks:", error));
    }, []);

    // Update filtered stocks when search term changes
    useEffect(() => {
      if (searchTerm) {
        setFilteredStocks(
          stocks.filter(stock => 
            stock.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.companySymbol.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        setFilteredStocks([]);
      }
    }, [searchTerm, stocks]);

    // Single savePortfolios function
    const savePortfolios = async (updatedPortfolios) => {
      setPortfolios(updatedPortfolios);
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, { portfolios: updatedPortfolios }, { merge: true });
        }
      } catch (error) {
        console.error("Error saving portfolios:", error);
      }
    };

    const addStockToPortfolio = (stock) => {
      const updatedPortfolios = [...portfolios];
      const existingStockIndex = updatedPortfolios[activePortfolio].stocks.findIndex(s => s.companySymbol === stock.companySymbol);
      if (existingStockIndex > -1) {
        updatedPortfolios[activePortfolio].stocks[existingStockIndex].quantity += 1;
      } else {
        updatedPortfolios[activePortfolio].stocks.push({ ...stock, quantity: 1 });
      }
      savePortfolios(updatedPortfolios);
      setSearchTerm("");
      setFilteredStocks([]);
      setShowDropdown(false);
    };

    const updateQuantity = (symbol, newQuantity) => {
      const updatedPortfolios = [...portfolios];
      const stock = updatedPortfolios[activePortfolio].stocks.find(s => s.companySymbol === symbol);
      if (stock) {
        stock.quantity = Math.max(1, parseInt(newQuantity) || 1);
        savePortfolios(updatedPortfolios);
      }
    };

    const removeStock = (symbol) => {
      const updatedPortfolios = [...portfolios];
      updatedPortfolios[activePortfolio].stocks = updatedPortfolios[activePortfolio].stocks.filter(s => s.companySymbol !== symbol);
      savePortfolios(updatedPortfolios);
    };

    const renamePortfolio = (index, newName) => {
      const updatedPortfolios = [...portfolios];
      updatedPortfolios[index].name = newName;
      savePortfolios(updatedPortfolios);
    };

    const calculatePortfolioStats = () => {
      const currentPortfolio = portfolios[activePortfolio].stocks;
      if (currentPortfolio.length === 0) return { totalInvested: 0, avgDividendPercent: 0, potentialReturn: 0 };

      const totalInvested = currentPortfolio.reduce((total, stock) => total + stock.stockPrice * stock.quantity, 0);
      const avgDividendPercent = currentPortfolio.reduce((total, stock) => total + stock.dividendPercent * stock.quantity, 0) / currentPortfolio.reduce((total, stock) => total + stock.quantity, 0);
      const potentialReturn = (totalInvested * avgDividendPercent) / 100;

      return { totalInvested, avgDividendPercent, potentialReturn };
    };

    const { totalInvested, avgDividendPercent, potentialReturn } = calculatePortfolioStats();

    const indexOfLastStock = currentPage * stocksPerPage;
    const indexOfFirstStock = indexOfLastStock - stocksPerPage;
    const currentStocks = portfolios[activePortfolio].stocks.slice(indexOfFirstStock, indexOfLastStock);
    const totalPages = Math.ceil(portfolios[activePortfolio].stocks.length / stocksPerPage);

    // Function to handle pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
      <>
        <ToastContainer />
        <LoginHeader user={props.user} onLoginClick={() => props.setShowModal(true)} onLogoutClick={props.handleLogout} />
        <LoginModal showModal={props.showModal} onClose={() => props.setShowModal(false)} />
     
        <div className="container-fluid mt-5 pt-5">
          <div className="row">
            {/* Left Sidebar for Portfolio Selection */}
            <div className="col-md-3 col-lg-2">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-gradient p-3" style={{ background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', borderRadius: '0.5rem 0.5rem 0 0' }}>
                  <h5 className="text-white mb-0 fw-bold">My Portfolios</h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {portfolios.map((portfolio, index) => (
                      <a 
                        key={index}
                        className={`list-group-item list-group-item-action py-3 px-3 ${activePortfolio === index ? 'active' : ''}`}
                        onClick={() => setActivePortfolio(index)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{portfolio.name}</span>
                          <button 
                            className={`btn btn-sm ${activePortfolio === index ? 'btn-light' : 'btn-outline-primary'}`}
                            style={{ borderRadius: '50%', width: '28px', height: '28px', padding: '0' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newName = prompt("Enter new portfolio name:", portfolio.name);
                              if (newName) renamePortfolio(index, newName);
                            }}
                          >
                            <i className="bi bi-pencil-fill" style={{ fontSize: '0.8rem' }}></i>
                          </button>
                        </div>
                        {activePortfolio === index && (
                          <small className="d-block mt-1 text-light">
                            {portfolio.stocks.length} stocks · ₹{portfolio.stocks.reduce((sum, stock) => sum + (stock.stockPrice * stock.quantity), 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                          </small>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Investment Summary */}
              <div className="card shadow-sm border-0">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Investment Summary</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="text-secondary small">Total Invested</div>
                    <div className="fw-bold h5 mb-0">₹{totalInvested.toLocaleString('en-IN', {maximumFractionDigits: 2})}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-secondary small">Average Dividend</div>
                    <div className="fw-bold h5 mb-0">{avgDividendPercent.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-secondary small">1 Year Potential Return</div>
                    <div className="fw-bold h5 mb-0 text-success">₹{potentialReturn.toLocaleString('en-IN', {maximumFractionDigits: 2})}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-md-9 col-lg-10">
              <div className="card shadow-lg border-0 mb-5">
                <div className="card-header bg-white p-4 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fw-bold text-primary mb-0">{portfolios[activePortfolio].name}</h3>
                    
                    {/* Search component with ref for click outside detection */}
                    <div className="position-relative" style={{ width: '350px' }} ref={searchRef}>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Search and add stocks..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={() => {
                            if (filteredStocks.length > 0) {
                              setShowDropdown(true);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && filteredStocks.length > 0) {
                              addStockToPortfolio(filteredStocks[0]);
                            }
                          }}
                          style={{ boxShadow: 'none' }}
                        />
                      </div>
                      
                      {/* Dropdown results - now controlled by showDropdown state */}
                      {showDropdown && filteredStocks.length > 0 && (
                        <div className="position-absolute bg-white border rounded w-100 shadow-sm" 
                            style={{ maxHeight: '250px', overflowY: 'auto', zIndex: 1000 }}>
                          {filteredStocks.map(stock => (
                            <div 
                              key={stock.companySymbol} 
                              className="p-3 border-bottom" 
                              style={{ cursor: 'pointer', transition: 'background 0.2s ease' }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                              onClick={() => addStockToPortfolio(stock)}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-bold">{stock.companyName}</div>
                                  <div className="text-secondary small">{stock.companySymbol}</div>
                                </div>
                                <div className="text-success fw-bold">₹{stock.stockPrice}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-body p-4">
                  {/* Empty state */}
                  {currentStocks.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-3" style={{ fontSize: '3rem', opacity: '0.2' }}>📈</div>
                      <h4 className="text-secondary">Your portfolio is empty</h4>
                      <p className="text-muted">Start by searching and adding stocks above</p>
                    </div>
                  ) : (
                    // Stocks table
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '30%' }}>Company</th>
                            <th>Price</th>
                            <th>Dividend</th>
                            <th>Quantity</th>
                            <th>Value</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentStocks.map((stock) => (
                            <tr key={stock.companySymbol}>
                              <td>
                                <div className="fw-bold">{stock.companyName}</div>
                                <div className="text-secondary small">{stock.companySymbol}</div>
                              </td>
                              <td>₹{stock.stockPrice}</td>
                              <td>{stock.dividendPercent}%</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <button 
                                    className="btn btn-sm btn-outline-secondary" 
                                    onClick={() => updateQuantity(stock.companySymbol, stock.quantity - 1)}
                                    style={{ borderRadius: '50%', width: '28px', height: '28px', padding: '0' }}
                                  >-</button>
                                  <input
                                    type="number"
                                    value={stock.quantity}
                                    onChange={(e) => updateQuantity(stock.companySymbol, e.target.value)}
                                    className="form-control form-control-sm mx-2"
                                    style={{ width: "50px", textAlign: "center" }}
                                  />
                                  <button 
                                    className="btn btn-sm btn-outline-secondary" 
                                    onClick={() => updateQuantity(stock.companySymbol, stock.quantity + 1)}
                                    style={{ borderRadius: '50%', width: '28px', height: '28px', padding: '0' }}
                                  >+</button>
                                </div>
                              </td>
                              <td className="fw-bold">₹{(stock.stockPrice * stock.quantity).toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-danger" 
                                  onClick={() => removeStock(stock.companySymbol)}
                                  style={{ borderRadius: '50px' }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(currentPage - 1)}
                            aria-label="Previous"
                          >
                            <span aria-hidden="true">&laquo;</span>
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, index) => (
                          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => paginate(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(currentPage + 1)}
                            aria-label="Next"
                          >
                            <span aria-hidden="true">&raquo;</span>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
};

export default Portfolio;