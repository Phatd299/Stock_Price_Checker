'use strict';

const axios = require('axios');
const crypto = require('crypto');

// Make stockLikes global for testing purposes
if (!global.stockLikes) {
  global.stockLikes = new Map();
}

// Function to anonymize IP address
function anonymizeIP(ip) {
  // Create a hash of the IP using SHA-256
  return crypto.createHash('sha256')
    .update(ip + process.env.SECRET || 'default-secret')
    .digest('hex')
    .slice(0, 16);
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      try {
        if (!req.query.stock) {
          return res.status(400).json({ error: 'Stock symbol is required' });
        }

        const stocks = Array.isArray(req.query.stock) ? req.query.stock : [req.query.stock];
        const like = req.query.like === 'true';
        const anonymizedIP = anonymizeIP(req.ip);

        // Function to get stock data
        async function getStockData(symbol) {
          try {
            if (!symbol) {
              throw new Error('Stock symbol is required');
            }

            const upperSymbol = symbol.toUpperCase();
            
            // Get stock price from API
            const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${upperSymbol}/quote`);
            
            // Parse the price from response
            let price = 0;
            if (response && response.data) {
              if (typeof response.data === 'number') {
                price = response.data;
              } else if (typeof response.data === 'string') {
                price = parseFloat(response.data);
              }
            }

            // Ensure price is a valid number
            if (isNaN(price)) {
              price = 0;
            }
            
            // Handle likes
            if (!global.stockLikes.has(upperSymbol)) {
              global.stockLikes.set(upperSymbol, new Set());
            }
            
            if (like && !global.stockLikes.get(upperSymbol).has(anonymizedIP)) {
              global.stockLikes.get(upperSymbol).add(anonymizedIP);
            }

            return {
              stock: upperSymbol,
              price: price,
              likes: global.stockLikes.get(upperSymbol).size
            };
          } catch (error) {
            console.error(`Error fetching stock data for ${symbol}:`, error.message);
            return {
              stock: symbol.toUpperCase(),
              price: 0,
              likes: global.stockLikes.has(symbol.toUpperCase()) ? global.stockLikes.get(symbol.toUpperCase()).size : 0
            };
          }
        }

        // Handle single stock
        if (stocks.length === 1) {
          const stockData = await getStockData(stocks[0]);
          return res.json({ stockData });
        }
        
        // Handle stock comparison (2 stocks)
        if (stocks.length === 2) {
          const [stock1Data, stock2Data] = await Promise.all([
            getStockData(stocks[0]),
            getStockData(stocks[1])
          ]);
          
          const stockData = [
            { 
              stock: stock1Data.stock,
              price: stock1Data.price,
              rel_likes: stock1Data.likes - stock2Data.likes
            },
            { 
              stock: stock2Data.stock,
              price: stock2Data.price,
              rel_likes: stock2Data.likes - stock1Data.likes
            }
          ];
          
          return res.json({ stockData });
        }

        res.status(400).json({ error: 'Invalid number of stocks provided' });
        
      } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Error processing request' });
      }
    });
};
