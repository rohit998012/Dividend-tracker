import React, { useState, useMemo } from "react";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";

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

  // Function to render sort icon
  const renderSortIcon = (column) => {
    if (sortColumn === column) {
      return sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort style={{ color: "#aaa" }} />;
  };

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

      {/* Table with fixed column widths */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <colgroup>
            <col style={{ width: "30%" }} /> {/* Name column */}
            <col style={{ width: "15%" }} /> {/* Stock Price column */}
            <col style={{ width: "25%" }} /> {/* Sector column */}
            <col style={{ width: "15%" }} /> {/* Market Cap column */}
            <col style={{ width: "15%" }} /> {/* Dividend % column */}
          </colgroup>
          <thead className="table-primary">
            <tr>
              <th className="text-nowrap">Name</th>
              <th className="text-nowrap" onClick={() => handleSort("stockPrice")} style={{ cursor: "pointer" }}>
                Stock Price {renderSortIcon("stockPrice")}
              </th>
              <th className="text-nowrap">Sector</th>
              <th className="text-nowrap">Market Cap</th>
              <th className="text-nowrap" onClick={() => handleSort("dividendPercent")} style={{ cursor: "pointer" }}>
                Dividend % (1 Year) {renderSortIcon("dividendPercent")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStocks.map((stock, index) => (
              <tr key={index}>
                <td className="text-truncate" style={{ maxWidth: "0" }}>{stock.companyName}</td>
                <td className="text-nowrap">₹ {stock.stockPrice}</td>
                <td className="text-truncate" style={{ maxWidth: "0" }}>{stock.sector}</td>
                <td className="text-nowrap">{stock.marketCapCategory}</td>
                <td className="text-nowrap">{stock.dividendPercent == null ? 0 : stock.dividendPercent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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