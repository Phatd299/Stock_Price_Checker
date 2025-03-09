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
    .slice(0, 16); // Take first 16 characters of hash for shorter storage
}

module.exports = function (app) {
  // Add new endpoint to view likes data
  app.route('/api/stock-likes-data')
    .get(function (req, res) {
      const likesData = {};
      global.stockLikes.forEach((value, key) => {
        likesData[key] = {
          totalLikes: value.size,
          anonymousIPs: Array.from(value)
        };
      });
      res.json({
        totalStocks: global.stockLikes.size,
        stocksData: likesData
      });
    });

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      try {
        const stocks = Array.isArray(req.query.stock) ? req.query.stock : [req.query.stock];
        const like = req.query.like === 'true';
        const anonymizedIP = anonymizeIP(req.ip);

        // Function to get stock data
        async function getStockData(symbol) {
          try {
            const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
            // Ensure price is a valid number
            let price = 0;
            if (response.data) {
              price = parseFloat(response.data);
              if (isNaN(price)) {
                price = 0;
              }
            }
            
            // Handle likes with anonymized IP
            if (!global.stockLikes.has(symbol)) {
              global.stockLikes.set(symbol, new Set());
            }
            
            if (like && !global.stockLikes.get(symbol).has(anonymizedIP)) {
              global.stockLikes.get(symbol).add(anonymizedIP);
            }
            
            return {
              stock: symbol.toUpperCase(),
              price: price,
              likes: global.stockLikes.get(symbol).size
            };
          } catch (error) {
            throw new Error(`Error fetching stock data for ${symbol}`);
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
          
          // Calculate relative likes
          const stock1Likes = stock1Data.likes;
          const stock2Likes = stock2Data.likes;
          
          const stockData = [
            { 
              stock: stock1Data.stock,
              price: stock1Data.price,
              rel_likes: stock1Likes - stock2Likes
            },
            { 
              stock: stock2Data.stock,
              price: stock2Data.price,
              rel_likes: stock2Likes - stock1Likes
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
