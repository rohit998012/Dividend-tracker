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
  const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1mo&range=1y`;
  console.log(`Fetching: ${apiUrl}`);

  try {
    const response = await page.evaluate(async (apiUrl, headers) => {
      const res = await fetch(apiUrl, { headers });
      return res.ok ? res.json() : { error: res.status };
    }, apiUrl, headers);

    console.log("Fetched Data:", JSON.stringify(response));
  } catch (error) {
    console.error("Error:", error.message);
  }

  await browser.close();
}

fetchDividendData("BHARTIARTL");
