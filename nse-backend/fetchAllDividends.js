import fs from 'fs';
import fetch from 'node-fetch';
import puppeteer from "puppeteer";

async function fetchDividendData(symbol) {
    const browser = await puppeteer.launch({ headless: false }); // Use headless: false for debugging
    const page = await browser.newPage();
  
    // Go to Yahoo Finance historical data page
    const url = `https://finance.yahoo.com/quote/${symbol}.NS/history?p=${symbol}.NS`;
    await page.goto(url, { waitUntil: "networkidle2" });
  
    // Get Cookies
    const cookies = await page.cookies();
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    console.log("Cookies:", cookieString);
  
    // Extract headers from Puppeteer session
    const headers = {
      "User-Agent": await page.evaluate(() => navigator.userAgent),
      Accept: "application/json",
      Referer: "https://finance.yahoo.com/",
      Origin: "https://finance.yahoo.com",
      Cookie: cookieString,
    };
  
    // Try Fetching API
    const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1mo&range=1y&events=div`;
    console.log(`Fetching: ${apiUrl}`);
  
    try {
      const response = await page.evaluate(async (apiUrl, headers) => {
        const res = await fetch(apiUrl, { headers });
        return res.ok ? res.json() : { error: res.status };
      }, apiUrl, headers);
  
      console.log("Fetched Data:", JSON.stringify(response));
      await browser.close();
      return response;
    } catch (error) {
      console.error("Error:", error.message);
    }
  
    await browser.close();
  }
  

// Example: Fetch dividends for "BHARTIARTL"
function calculateDividendYield(dataArray) {
  let dividendMap = new Map();

  dataArray.forEach(element => {
      if (!element || !element.meta || !element.meta.symbol) {
          console.warn("⚠️ Skipping invalid entry:", element);
          return; // Skip if data is missing
      }

      const symbol = element.meta.symbol;
      const currentPrice = element.meta.regularMarketPrice || 0; // Avoid division by zero
      const dividends = element.events?.dividends || {}; // Ensure events exist

      let totalDividends = Object.values(dividends).reduce((sum, div) => sum + (div.amount || 0), 0);
      let dividendYield = currentPrice > 0 ? (totalDividends / currentPrice) * 100 : 0;

      dividendMap.set(symbol, dividendYield.toFixed(2)); // Store as a percentage with 2 decimal places
  });

  return dividendMap;
}




async function updateDividends() {
  try {
    console.log('Reading Nifty100.json...');
    const data = await fs.promises.readFile('./Nifty100.json', 'utf-8');
    const stocks = JSON.parse(data);

    const invalidSymbols = ['NIFTY 50', 'NIFTY 100', 'NIFTY NEXT 50'];
    const validStocks = stocks.filter(stock => !invalidSymbols.includes(stock.symbol));
    console.log(validStocks);
    console.log(`Found ${validStocks.length} stock symbols. Fetching dividend data...`);

    const result = [];
    for (const stock of validStocks) {
      console.log(`Fetching dividend data for ${stock.symbol}...`);
      const dividendData = await fetchDividendData(stock.symbol);
      console.log(typeof dividendData);
      
      if (dividendData) {
        // Add marketCapCategory to the dividend data
        dividendData.marketCapCategory = stock.marketCapCategory;
        dividendData.sector = stock.sector;
        dividendData.companyName = stock.companyName
      }
    
        result.push(dividendData)
        

      await new Promise(resolve => setTimeout(resolve, 3000));
   
    }
    fs.writeFileSync('Dividends.json', JSON.stringify(result, null, 2));
    
    
    console.log('✅ Dividend data saved to Dividends.json');
  } catch (error) {
    console.error('Error updating dividends:', error.message);
  }
}

updateDividends();


