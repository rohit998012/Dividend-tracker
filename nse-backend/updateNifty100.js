// import puppeteer from 'puppeteer';
// import fs from 'fs';

// const NIFTY50_URL = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050';
// const NIFTY_NEXT50_URL = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20NEXT%2050';

// async function fetchDataWithPuppeteer(url) {
//     const browser = await puppeteer.launch({ headless: 'new' }); // Headless mode
//     const page = await browser.newPage();

//     // Set user agent to mimic a real browser
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

//     try {
//         console.log(`Fetching data from: ${url}`);

//         // Navigate to NSE home to set required cookies
//         await page.goto('https://www.nseindia.com', { waitUntil: 'domcontentloaded' });

//         // Make the API request within Puppeteer
//         const response = await page.evaluate(async (url) => {
//             const res = await fetch(url);
//             return res.ok ? await res.json() : null;
//         }, url);

//         return response?.data || [];
//     } catch (error) {
//         console.error(`Error fetching data from ${url}:`, error.message);
//         return [];
//     } finally {
//         await browser.close();
//     }
// }

// async function updateNifty100() {
//     console.log("Fetching NIFTY 50 constituents...");
//     const nifty50 = await fetchDataWithPuppeteer(NIFTY50_URL);
//     console.log(`Fetched ${nifty50.length} stocks from NIFTY 50.`);

//     console.log("Fetching NIFTY Next 50 constituents...");
//     const niftyNext50 = await fetchDataWithPuppeteer(NIFTY_NEXT50_URL);
//     console.log(`Fetched ${niftyNext50.length} stocks from NIFTY Next 50.`);

//     const nifty100 = [...nifty50, ...niftyNext50];

//     console.log(`Total stocks in NIFTY 100: ${nifty100.length}`);

//     // Extract only the symbols
//     const result = [];
//     for (let i = 0; i < nifty100.length; i++) {
//         result.push(nifty100[i].symbol);
//     }

//     // Save only symbols to the file
//     fs.writeFileSync('nifty100.json', JSON.stringify(result, null, 2));
//     console.log("Stock symbols successfully saved to nifty100.json");
// }

// // Call function
// updateNifty100();

import puppeteer from 'puppeteer';
import fs from 'fs';

const NIFTY50_URL = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050';
const NIFTY_NEXT50_URL = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20NEXT%2050';

// Function to classify stocks based on market cap
function classifyMarketCap(marketCap) {
    if (marketCap >= 28000 * 1e7) return "Large Cap"; // ₹28,000 Cr and above
    if (marketCap >= 8500 * 1e7) return "Mid Cap"; // ₹8,500 Cr - ₹28,000 Cr
    return "Small Cap"; // Below ₹8,500 Cr
}

async function fetchDataWithPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: 'new' }); // Headless mode
    const page = await browser.newPage();

    // Set user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

    try {
        console.log(`Fetching data from: ${url}`);

        // Navigate to NSE home to set required cookies
        await page.goto('https://www.nseindia.com', { waitUntil: 'domcontentloaded' });

        // Make the API request within Puppeteer
        const response = await page.evaluate(async (url) => {
            const res = await fetch(url);
            return res.ok ? await res.json() : null;
        }, url);

        return response?.data || [];
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error.message);
        return [];
    } finally {
        await browser.close();
    }
}

async function updateNifty100() {
    console.log("Fetching NIFTY 50 constituents...");
    const nifty50 = await fetchDataWithPuppeteer(NIFTY50_URL);
    console.log(`Fetched ${nifty50.length} stocks from NIFTY 50.`);

    console.log("Fetching NIFTY Next 50 constituents...");
    const niftyNext50 = await fetchDataWithPuppeteer(NIFTY_NEXT50_URL);
    console.log(`Fetched ${niftyNext50.length} stocks from NIFTY Next 50.`);
    console.log(niftyNext50);
    
    const nifty100 = [...nifty50, ...niftyNext50];

    console.log(`Total stocks in NIFTY 100: ${nifty100.length}`);

    // Extract symbols and market cap classification
    const result = nifty100.map(stock => ({
        symbol: stock.symbol,
        marketCapCategory: classifyMarketCap(stock.ffmc || 0), // Classify based on FFMC
        sector : stock.meta?.industry,
        companyName : stock.meta?.companyName
    }));

    // Save to file
    fs.writeFileSync('nifty100.json', JSON.stringify(result, null, 2));
    console.log("Stock symbols and market cap classification successfully saved to nifty100.json");
}

// Call function
updateNifty100();
