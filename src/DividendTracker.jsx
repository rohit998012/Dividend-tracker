import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LoginHeader from "./LoginHeader";
import Banner from "./Banner";
import "./App.css";

const stocks = [
  { name: "Zomato", sector: "Consumer Services", return: "5%", marketCap : "Large Cap" },
  { name: "Tata Motors", sector: "Automobile", return: "2%", marketCap : "Mid Cap" },
  { name: "MRF", sector: "Tyres & Tubes", return: "4.4%", marketCap : "Large Cap" },
  { name: "Infibeam Avenues", sector: "Information Technology", return: "1.25%", marketCap : "Small cap" },
];

export default function DividendTracker() {
  return (
    <>
      <LoginHeader />
      <Banner />
      <div className="container-fluid p-4">
        <div className="row mt-4">
          {/* Left Section - Search & Table */}
          <div className="col-12 col-md-8 mb-4">
            <div className="mb-3">
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Search..." />
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Sector</th>
                    <th>1 Year Return</th>
                    <th>Market cap</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock, index) => (
                    <tr key={index}>
                      <td>{stock.name}</td>
                      <td>{stock.sector}</td>
                      <td>{stock.marketCap}</td>
                      <td>{stock.return}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// LoginHeader Component

// Banner Component

