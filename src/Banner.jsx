export default function Banner() {
    return (
        
      <div className="bg-light px-5 py-4 rounded shadow-sm"  style={{marginTop:"12vh"}}>
        <div className="d-flex justify-content-between align-items-center">
          {/* Main Heading */}
          <h3 className="fw-bold mb-0 flex-grow-1">India’s One & Only Dividend Tracker</h3>
  
          {/* Bullet Points Box */}
          <div className="p-3 bg-white rounded shadow-sm w-50">
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
  