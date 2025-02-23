import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginHeader from "./LoginHeader";
import Banner from "./Banner";
import './App.css'
import "bootstrap-icons/font/bootstrap-icons.css";

const stocks = [
  { name: "Zomato", sector: "Consumer Services", return: "5%" },
  { name: "Tata Motors", sector: "Automobile", return: "2%" },
  { name: "MRF", sector: "Tyres & Tubes", return: "4.4%" },
  { name: "Infibeam Avenues", sector: "Information Technology", return: "1.25%" },
];

export default function DividendTracker() {
  return (
    <>
    <LoginHeader/>
    <Banner/>
    <div className="container-fluid p-4">
      {/* Top Navigation */}


      {/* Header */}
 

      <div className="row mt-4">
        {/* Left Section - Search & Table */}
        <div className="col-md-8">
          <div className="mb-3">
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Search..." />
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
            </div>
          </div>

          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Sector</th>
                <th>1 Year Return</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.name}</td>
                  <td>{stock.sector}</td>
                  <td>{stock.return}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Section - Sidebar */}

      </div>
    </div>
    </>
  );
}
