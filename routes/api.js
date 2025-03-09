'use strict';

const axios = require('axios');

// Memory store for likes
const stockLikes = new Map();

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      try {
        const stocks = Array.isArray(req.query.stock) ? req.query.stock : [req.query.stock];
        const like = req.query.like === 'true';
        const ip = req.ip;

        // Function to get stock data
        async function getStockData(symbol) {
          try {
            const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
            const price = response.data;
            
            // Handle likes
            if (!stockLikes.has(symbol)) {
              stockLikes.set(symbol, new Set());
            }
            
            if (like && !stockLikes.get(symbol).has(ip)) {
              stockLikes.get(symbol).add(ip);
            }
            
            return {
              stock: symbol.toUpperCase(),
              price: price,
              likes: stockLikes.get(symbol).size
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
          const rel_likes1 = stock1Data.likes - stock2Data.likes;
          const rel_likes2 = stock2Data.likes - stock1Data.likes;
          
          const stockData = [
            { stock: stock1Data.stock, price: stock1Data.price, rel_likes: rel_likes1 },
            { stock: stock2Data.stock, price: stock2Data.price, rel_likes: rel_likes2 }
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
