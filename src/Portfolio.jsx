import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "./firebase";
import { ToastContainer} from "react-toastify";
import { app } from "./firebase"; 
import LoginHeader from "./LoginHeader";
import LoginModal from "./LoginModal";
const Portfolio = (props) => {
    const db = getFirestore(app);
    useEffect(() => {
        const fetchPortfolios = async () => {
          try {
            const docRef = doc(db, "users", "portfolioData");
            const docSnap = await getDoc(docRef);
      
            if (docSnap.exists()) {
              setPortfolios(docSnap.data().portfolios);
            }
          } catch (error) {
            console.error("Error loading portfolios:", error);
          }
        };
      
        fetchPortfolios();
      }, []);
      const savePortfolios = async (updatedPortfolios) => {
        setPortfolios(updatedPortfolios);
        try {
          const user = auth.currentUser;
          if (user) {
            const userDoc = doc(db, "users", user.uid);
            await setDoc(userDoc, { portfolios: updatedPortfolios });
          }
        } catch (error) {
          console.error("Error saving portfolios:", error);
        }
      };
  const [stocks, setStocks] = useState([]);
  const [activePortfolio, setActivePortfolio] = useState(0);
  const [portfolios, setPortfolios] = useState([
    { name: "Portfolio 1", stocks: [] },
    { name: "Portfolio 2", stocks: [] },
    { name: "Portfolio 3", stocks: [] }
  ]);
  const userId = auth.currentUser?.uid || "guest";
const userDocRef = doc(db, "users", userId);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const stocksPerPage = 7;

  useEffect(() => {
    fetch("http://localhost:5000/stocks")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch stocks");
        return response.json();
      })
      .then((data) => setStocks(data))
      .catch((error) => console.error("Error fetching stocks:", error));
  }, []);
  useEffect(() => {
    const savePortfolios = async () => {
      try {
        await setDoc(userDocRef, { portfolios });
      } catch (error) {
        console.error("Error saving portfolios:", error);
      }
    };
    savePortfolios();
  }, [portfolios]);
  const addStockToPortfolio = (stock) => {
    const updatedPortfolios = [...portfolios];
    const existingStockIndex = updatedPortfolios[activePortfolio].stocks.findIndex(s => s.companySymbol === stock.companySymbol);
    if (existingStockIndex > -1) {
      updatedPortfolios[activePortfolio].stocks[existingStockIndex].quantity += 1;
    } else {
      updatedPortfolios[activePortfolio].stocks.push({ ...stock, quantity: 1 });
    }
    savePortfolios(updatedPortfolios)
    setSearchTerm("");
  };

  const updateQuantity = (symbol, newQuantity) => {
    const updatedPortfolios = [...portfolios];
    const stock = updatedPortfolios[activePortfolio].stocks.find(s => s.companySymbol === symbol);
    if (stock) {
      stock.quantity = Math.max(1, parseInt(newQuantity) || 1);
      savePortfolios(updatedPortfolios)
    }
  };

  const removeStock = (symbol) => {
    const updatedPortfolios = [...portfolios];
    updatedPortfolios[activePortfolio].stocks = updatedPortfolios[activePortfolio].stocks.filter(s => s.companySymbol !== symbol);
    savePortfolios(updatedPortfolios)
  };

  const renamePortfolio = (index, newName) => {
    const updatedPortfolios = [...portfolios];
    updatedPortfolios[index].name = newName;
    savePortfolios(updatedPortfolios)
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

  return (
    <>
         <ToastContainer />
          <LoginHeader user={props.user} onLoginClick={() => props.setShowModal(true)} onLogoutClick={props.handleLogout} />
          <LoginModal showModal={props.showModal} onClose={() => props.setShowModal(false)} />
     
    <div className="container mt-4">
      <div className="mb-3">
        <ul className="nav nav-pills justify-content-center" style={{ fontSize: "1.2rem" }}>
          {portfolios.map((portfolio, index) => (
            <li className="nav-item" key={index} style={{ margin: '0 5px', cursor: 'pointer' }}>
              <a
                className={`nav-link ${activePortfolio === index ? "active" : ""}`}
                onClick={() => setActivePortfolio(index)}
                style={{ padding: "5px 10px", cursor: "pointer" }}
              >
                Portfolio {index + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="text-center mb-3">
        <span className="me-2">{portfolios[activePortfolio].name}</span>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => {
          const newName = prompt("Enter new portfolio name:", portfolios[activePortfolio].name);
          if (newName) renamePortfolio(activePortfolio, newName);
        }}>
          ✏️
        </button>
      </h2>

      <div className="text-center mt-4">
        <input
          type="text"
          className="form-control mb-3"
          style={{ width: '300px', margin: '0 auto' }}
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const selectedStock = stocks.find(stock => `${stock.companyName} (${stock.companySymbol})`.toLowerCase() === searchTerm.toLowerCase());
              if (selectedStock) addStockToPortfolio(selectedStock);
            }
          }}
          list="stock-options"
        />
        <datalist id="stock-options">
          {stocks.filter(stock => stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())).map(stock => (
            <option
              key={stock.companySymbol}
              value={`${stock.companyName} (${stock.companySymbol})`}
              onClick={() => addStockToPortfolio(stock)}
            />
          ))}
        </datalist>
      </div>

      <table className="table table-striped table-bordered mt-4">
        <thead>
          <tr>
            <th>Company</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentStocks.map((stock) => (
            <tr key={stock.companySymbol}>
              <td>{stock.companyName} ({stock.companySymbol})</td>
              <td>
                <input
                  type="number"
                  value={stock.quantity}
                  onChange={(e) => updateQuantity(stock.companySymbol, e.target.value)}
                  className="form-control form-control-sm"
                  style={{ width: "60px", textAlign: "center" }}
                />
              </td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => removeStock(stock.companySymbol)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-3 text-center">
    <div><strong>Total Invested:</strong> ₹{totalInvested.toFixed(2)}</div>
    <div><strong>Avg Dividend:</strong> {avgDividendPercent.toFixed(2)}%</div>
    <div><strong>1 Year Return:</strong> ₹{potentialReturn.toFixed(2)}</div>
  </div>
  </>
  );
};

export default Portfolio;