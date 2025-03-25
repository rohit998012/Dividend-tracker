import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/SHRIRAMFIN.NS?interval=1mo&range=1y&events=div';

  try {
    const response = await page.goto(url);
    const data = await response.json();
    console.log('Shriram Finance Data:', data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }

  await browser.close();
})();