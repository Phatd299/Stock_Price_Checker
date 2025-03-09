const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

describe('Functional Tests', function() {
  // Clear likes before each test
  beforeEach(function() {
    // Reset the stockLikes Map in api.js
    const api = require('../routes/api.js');
    global.stockLikes = new Map();
  });
  
  // Test 1: Viewing one stock
  it('Viewing one stock: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isString(res.body.stockData.stock);
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.equal(res.body.stockData.likes, 0);
        done();
      });
  });

  // Test 2: Viewing one stock and liking it
  it('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'MSFT', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isString(res.body.stockData.stock);
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        assert.equal(res.body.stockData.stock, 'MSFT');
        assert.equal(res.body.stockData.likes, 1);
        done();
      });
  });

  // Test 3: Viewing the same stock and liking it again
  it('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'MSFT', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isString(res.body.stockData.stock);
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        assert.equal(res.body.stockData.stock, 'MSFT');
        assert.equal(res.body.stockData.likes, 1);
        done();
      });
  });

  // Test 4: Viewing two stocks
  it('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        
        // Check first stock
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.isString(res.body.stockData[0].stock);
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        
        // Check second stock
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.isString(res.body.stockData[1].stock);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[1].rel_likes);
        
        done();
      });
  });

  // Test 5: Viewing two stocks and liking them
  it('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        
        // Check first stock
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.isString(res.body.stockData[0].stock);
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        
        // Check second stock
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.isString(res.body.stockData[1].stock);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[1].rel_likes);
        
        // Both stocks should have been liked, so rel_likes should be 0
        assert.equal(res.body.stockData[0].rel_likes, 0);
        assert.equal(res.body.stockData[1].rel_likes, 0);
        
        done();
      });
  });

  after(function() {
    // Clean up after all tests are done
    global.stockLikes = new Map();
  });
});
