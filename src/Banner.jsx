export default function Banner() {
    return (
      <div className="bg-light px-4 py-4 rounded shadow-sm w-100" style={{ marginTop: "12vh" }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          <h3 className="fw-bold text-center text-md-start mb-4 mb-md-0 me-md-4">
            Nifty 100 Dividend Tracker
          </h3>
          <div className="p-3 bg-white rounded shadow-sm w-100 w-md-50">
            <ul className="list-unstyled mb-0">
              <li className="mb-3 d-flex align-items-center">
                ✅ <span className="ms-2">Analyze stock dividends</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                ✅ <span className="ms-2">Compare dividends</span>
              </li>
              <li className="mb-0 d-flex align-items-center">
                ✅ <span className="ms-2">Make your own portfolio</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  