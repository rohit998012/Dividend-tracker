import fs from 'fs';
const data = await fs.promises.readFile('./Dividends.json', 'utf-8');
    const stocks = JSON.parse(data);


 let dividend = null;

 let resultArray = [];

for(let i=0; i < stocks.length; i++)
{   
    
  
    dividend = stocks[i].chart?.result[0]?.events?.dividends || null;
    if(dividend == null)
    {
        resultArray.push({
            "companySymbol" : stocks[i].chart?.result[0]?.meta.symbol,
            "companyName" : stocks[i].companyName,
            "totalDividend" : null,
            "stockPrice" : stocks[i].chart?.result[0]?.meta.regularMarketPrice,
            "dividendPercent" : null,
            "marketCapCategory" : stocks[i].marketCapCategory,
            "sector" : stocks[i].sector
        })
        continue;
    }
    const totalAmount = Object.values(dividend).reduce((sum, entry) => sum + entry.amount, 0);
    

resultArray.push({
    "companySymbol" : stocks[i].chart?.result[0]?.meta.symbol,
    "companyName" : stocks[i].companyName,
    "totalDividend" : totalAmount,
    "stockPrice" : stocks[i].chart?.result[0]?.meta.regularMarketPrice,
    "dividendPercent" : ((totalAmount/stocks[i].chart?.result[0]?.meta.regularMarketPrice)*100).toFixed(2),
    "marketCapCategory" : stocks[i].marketCapCategory,
    "sector" : stocks[i].sector
})
}
console.log(resultArray.length)
fs.writeFileSync('resultFile.json', JSON.stringify(resultArray, null, 2));

