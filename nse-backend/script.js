import puppeteer from 'puppeteer';
import fs from 'fs';
import fetch from 'node-fetch'; // Make sure you've installed node-fetch

const NIFTY50_URL = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050';
const NIFTY_NEXT50_URL = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20NEXT%2050';
let stockData = []; // Will store the processed Nifty 100 data

// Simple delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to classify stocks based on market cap
function classifyMarketCap(marketCap) {
    if (marketCap >= 20000 * 1e7) return "Large Cap"; // ₹20,000 Cr
    if (marketCap >= 5000 * 1e7) return "Mid Cap";  // ₹5,000 Cr
    return "Small Cap";
}


async function fetchDataWithCookies() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Configure the page
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
        // Navigate to NSE homepage to get the cookies
        console.log('Navigating to NSE homepage to get cookies...');
        await page.goto('https://www.nseindia.com', { 
            waitUntil: 'networkidle2',
            timeout: 60000
        });
        
        // Wait for some time to make sure cookies are set
        await delay(5000);
        
        // Extract cookies from the page
        const cookies = await page.cookies();
        console.log(`Got ${cookies.length} cookies from NSE`);
        
        // Create a fetch function that includes the cookies
        const fetchWithCookies = async (url) => {
            console.log(`Fetching data from: ${url}`);
            
            // Create cookie string from cookie objects
            const cookieString = cookies
                .map(cookie => `${cookie.name}=${cookie.value}`)
                .join('; ');
            
            // Create a request using fetch inside the browser context
            const response = await page.evaluate(
                async (url, cookieStr) => {
                    try {
                        const res = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Accept-Language': 'en-US,en;q=0.9',
                                'Cookie': cookieStr,
                                'Referer': 'https://www.nseindia.com/',
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                            },
                            credentials: 'include'
                        });
                        
                        if (!res.ok) {
                            console.error(`HTTP error! Status: ${res.status}`);
                            return null;
                        }
                        
                        return await res.json();
                    } catch (error) {
                        console.error('Error in fetch:', error);
                        return null;
                    }
                },
                url,
                cookieString
            );
            
            console.log(`Response status for ${url.split('?')[1]}: ${response ? 'Success' : 'Failed'}`);
            return response?.data || [];
        };
        
        // Fetch NIFTY 50 data
        console.log("Fetching NIFTY 50 constituents...");
        const nifty50 = await fetchWithCookies(NIFTY50_URL);
        console.log(`Fetched ${nifty50.length} stocks from NIFTY 50.`);
        
        // Fetch NIFTY Next 50 data
        console.log("Fetching NIFTY Next 50 constituents...");
        const niftyNext50 = await fetchWithCookies(NIFTY_NEXT50_URL);
        console.log(`Fetched ${niftyNext50.length} stocks from NIFTY Next 50.`);
        
        return { nifty50, niftyNext50 };
    } catch (error) {
        console.error("Error:", error);
        return { nifty50: [], niftyNext50: [] };
    } finally {
        await browser.close();
    }
}

async function updateNifty100() {
    try {
        const { nifty50, niftyNext50 } = await fetchDataWithCookies();
        
        const nifty100 = [...nifty50, ...niftyNext50];
        console.log(`Total stocks in NIFTY 100: ${nifty100.length}`);
        
        if (nifty100.length === 0) {
            console.error("Failed to retrieve any stock data.");
            return false;
        }
        
        // Extract required information
        stockData = nifty100.map(stock => ({
            symbol: stock.symbol,
            marketCapCategory: classifyMarketCap(stock.ffmc || 0),
            sector: stock.meta?.industry || 'Unknown',
            companyName: stock.meta?.companyName || stock.symbol,
            price : stock.price,
        }));
        
        // Save to file for debugging purposes (optional)
        fs.writeFileSync('nifty100.json', JSON.stringify(stockData, null, 2));
        console.log("Stock symbols and market cap classification successfully saved to nifty100.json");
        return true;
    } catch (error) {
        console.error("Failed to update Nifty 100 data:", error);
        return false;
    }
}

async function fetchDividendData(symbol) {
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 90000 // Increase timeout for browser launch
    });
    
    const page = await browser.newPage();
    
    try {
        // Set navigation timeout to a higher value
        page.setDefaultNavigationTimeout(90000); // 90 seconds
        
        // Go to Yahoo Finance historical data page
        const url = `https://finance.yahoo.com/quote/${symbol}.NS/history?p=${symbol}.NS`;
        console.log(`Navigating to ${url}`);
        
        await page.goto(url, { 
            waitUntil: "networkidle2", 
            timeout: 90000 // Increase page navigation timeout
        });
        
        // Wait additional time after page load to ensure everything is ready
        await delay(3000);
        
        // Get Cookies
        const cookies = await page.cookies();
        const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
        
        // Extract headers from Puppeteer session
        const headers = {
            "User-Agent": await page.evaluate(() => navigator.userAgent),
            "Accept": "application/json",
            "Referer": "https://finance.yahoo.com/",
            "Origin": "https://finance.yahoo.com",
            "Cookie": cookieString,
        };
        
        // Try Fetching API
        const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1mo&range=1y&events=div`;
        console.log(`Fetching: ${apiUrl}`);
        
        const response = await page.evaluate(async (apiUrl, headers) => {
            try {
                const res = await fetch(apiUrl, { headers });
                if (!res.ok) return { error: res.status };
                return await res.json();
            } catch (error) {
                return { error: error.message };
            }
        }, apiUrl, headers);
        
        console.log(`Data fetched for ${symbol}`);
        return {
            symbol,
            chart: response.chart,
            error: response.error
        };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        return {
            symbol,
            error: error.message
        };
    } finally {
        // Make sure we close the browser to prevent resource leaks
        try {
            await browser.close();
        } catch (err) {
            console.error("Error closing browser:", err.message);
        }
    }
}

async function processDividendData() {
    try {
        // First, ensure we have the Nifty100 data
        if (stockData.length === 0) {
            console.log('No stock data available, fetching from NSE first...');
            const success = await updateNifty100();
            if (!success) {
                console.error('Failed to fetch Nifty 100 data. Cannot proceed with dividend updates.');
                return [];
            }
        }
        
        const invalidSymbols = ['NIFTY 50', 'NIFTY 100', 'NIFTY NEXT 50'];
        const validStocks = stockData.filter(stock => !invalidSymbols.includes(stock.symbol));
        
        console.log(`Found ${validStocks.length} valid stock symbols. Fetching dividend data...`);
        
        const resultArray = [];
        
        // Process one stock at a time sequentially to avoid timeouts
        for (let i = 0; i < validStocks.length; i++) {
            const stock = validStocks[i];
            console.log(`Processing stock ${i + 1} of ${validStocks.length}: ${stock.symbol}`);
            
            try {
                // Fetch dividend data for the current stock
                console.log(`Fetching dividend data for ${stock.symbol}...`);
                const dividendData = await fetchDividendData(stock.symbol);
                
                // Process dividend data
                const dividend = dividendData.chart?.result[0]?.events?.dividends || null;
                
                if (dividend == null) {
                    resultArray.push({
                        "companySymbol": dividendData.chart?.result[0]?.meta?.symbol || `${stock.symbol}.NS`,
                        "companyName": stock.companyName,
                        "totalDividend": null,
                        "stockPrice": dividendData.chart?.result[0]?.meta?.regularMarketPrice || null,
                        "dividendPercent": null,
                        "marketCapCategory": stock.marketCapCategory,
                        "sector": stock.sector
                    });
                } else {
                    const totalAmount = Object.values(dividend).reduce((sum, entry) => sum + entry.amount, 0);
                    const stockPrice = dividendData.chart?.result[0]?.meta?.regularMarketPrice || 0;
                    
                    resultArray.push({
                        "companySymbol": dividendData.chart?.result[0]?.meta?.symbol || `${stock.symbol}.NS`,
                        "companyName": stock.companyName,
                        "totalDividend": totalAmount,
                        "stockPrice": stockPrice,
                        "dividendPercent": stockPrice > 0 ? ((totalAmount / stockPrice) * 100).toFixed(2) : null,
                        "marketCapCategory": stock.marketCapCategory,
                        "sector": stock.sector
                    });
                }
                
                // Save the results after each stock in case the script gets interrupted
                fs.writeFileSync('resultFile.json', JSON.stringify(resultArray, null, 2));
                console.log(`Updated resultFile.json with ${resultArray.length} stocks`);
                
                // Wait between stocks to avoid overloading the servers
                if (i < validStocks.length - 1) {
                    console.log('Waiting before processing next stock...');
                    await delay(2000);
                }
            } catch (error) {
                console.error(`Error processing ${stock.symbol}:`, error.message);
                // Add the stock with error information
                resultArray.push({
                    "companySymbol": `${stock.symbol}.NS`,
                    "companyName": stock.companyName,
                    "totalDividend": null,
                    "stockPrice": stock.lastPrice,
                    "dividendPercent": null,
                    "marketCapCategory": stock.marketCapCategory,
                    "sector": stock.sector,
                  
                });
                
                // Save after each error too
                fs.writeFileSync('resultFile.json', JSON.stringify(resultArray, null, 2));
            }
        }
        
        console.log(`Processed ${resultArray.length} stocks for final result`);
        return resultArray;
    } catch (error) {
        console.error('Error processing dividend data:', error.message);
        return [];
    }
}

// Main execution
async function main() {
    await updateNifty100();
    const resultArray = await processDividendData();
    console.log(`Total stocks processed: ${resultArray.length}`);
    fs.writeFileSync('resultFile.json', JSON.stringify(resultArray, null, 2));
    console.log('✅ Final data saved to resultFile.json');
}

main();

