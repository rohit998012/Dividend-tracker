import React, { useState, useMemo } from "react";
import { FaSortUp, FaSortDown } from "react-icons/fa";

export default function StockTable({ stocks }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedMarketCap, setSelectedMarketCap] = useState("All");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const pageSetSize = 5;

  const uniqueSectors = [...new Set(stocks.map(stock => stock.sector))];
  const uniqueMarketCaps = [...new Set(stocks.map(stock => stock.marketCapCategory))];

  const filteredStocks = useMemo(() => {
    let filtered = stocks.filter(stock =>
      stock.companyName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedSector === "All" || stock.sector === selectedSector) &&
      (selectedMarketCap === "All" || stock.marketCapCategory === selectedMarketCap)
    );

    if (sortColumn) {
      filtered.sort((a, b) => {
        const valA = parseFloat(a[sortColumn]) || 0;
        const valB = parseFloat(b[sortColumn]) || 0;
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    return filtered;
  }, [stocks, searchQuery, selectedSector, selectedMarketCap, sortColumn, sortOrder]);

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const currentSetIndex = Math.floor((currentPage - 1) / pageSetSize);
  const startPage = currentSetIndex * pageSetSize + 1;
  const endPage = Math.min(startPage + pageSetSize - 1, totalPages);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="container-fluid mt-4">
      {/* Filters */}
      <div className="d-flex gap-2 mb-3">
        <div className="input-group w-25">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Company Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
        </div>

        <select className="form-select w-25" value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
          <option value="All">All Sectors</option>
          {uniqueSectors.map(sector => <option key={sector} value={sector}>{sector}</option>)}
        </select>
        <select className="form-select w-25" value={selectedMarketCap} onChange={(e) => setSelectedMarketCap(e.target.value)}>
          <option value="All">All Market Caps</option>
          {uniqueMarketCaps.map(marketCap => <option key={marketCap} value={marketCap}>{marketCap}</option>)}
        </select>
      </div>

      {/* Table */}
      <table className="table table-bordered">
        <thead className="table-primary">
          <tr>
            <th>Name</th>
            <th onClick={() => handleSort("stockPrice")} style={{ cursor: "pointer" }}>
              Stock Price {sortColumn === "stockPrice" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : null}
            </th>
            <th>Sector</th>
            <th>Market Cap</th>
            <th onClick={() => handleSort("dividendPercent")} style={{ cursor: "pointer" }}>
              Dividend % (1 Year) {sortColumn === "dividendPercent" ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : null}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedStocks.map((stock, index) => (
            <tr key={index}>
              <td>{stock.companyName}</td>
              <td>₹ {stock.stockPrice}</td>
              <td>{stock.sector}</td>
              <td>{stock.marketCapCategory}</td>
              <td>{stock.dividendPercent == null ? 0 : stock.dividendPercent}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-end">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(1)}>&laquo;</button>
            </li>

            <li className={`page-item ${startPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(startPage - 1)}>&lt;&lt;</button>
            </li>

            {pageNumbers.map(page => (
              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
              </li>
            ))}

            <li className={`page-item ${endPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(endPage + 1)}>&gt;&gt;</button>
            </li>

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(totalPages)}>&raquo;</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
