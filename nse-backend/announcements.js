import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: false }); 
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  await page.goto("https://www.moneycontrol.com/stocks/marketinfo/dividends_declared/index.php", {
    waitUntil: "networkidle2",
  });

  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".lhsGrayCard_web_grayBoxMain__3uS2_")).map(row => {
      const cols = row.querySelectorAll("td");
      return {
        company: cols[0]?.innerText.trim(),
        dividend: cols[1]?.innerText.trim(),
        exDate: cols[2]?.innerText.trim(),
      };
    }).slice(1, 6); // Get top 5 dividends
  });

  console.log(data);
  await browser.close();
})();
