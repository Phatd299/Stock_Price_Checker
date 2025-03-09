const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
// Viewing one stock: GET request to /api/stock-prices/
// Viewing one stock and liking it: GET request to /api/stock-prices/
// Viewing the same stock and liking it again: GET request to /api/stock-prices/
// Viewing two stocks: GET request to /api/stock-prices/
// Viewing two stocks and liking them: GET request to /api/stock-prices/
describe("Functional Tests", function () {
  // Clear likes before all tests
  before(function() {
    global.stockLikes = new Map();
  });

  describe("5 functional get request tests", function () {
    it("1. Viewing one stock: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock: "GOOG" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.isNumber(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          assert.equal(res.body.stockData.likes, 0);
          done();
        });
    });
    it("2. Viewing one stock and liking it: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock: "GOOG", like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.isNumber(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          assert.equal(res.body.stockData.likes, 1);
          done();
        });
    });
    it("3. Viewing the same stock and liking it again: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock: "GOOG", like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.isNumber(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          assert.equal(res.body.stockData.likes, 1);
          done();
        });
    });
    it("4. Viewing two stocks: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock: ["GOOG", "MSFT"] })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData.length, 2);
          
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.isNumber(res.body.stockData[0].price);
          assert.isNumber(res.body.stockData[0].rel_likes);
          
          assert.equal(res.body.stockData[1].stock, "MSFT");
          assert.isNumber(res.body.stockData[1].price);
          assert.isNumber(res.body.stockData[1].rel_likes);
          
          assert.equal(res.body.stockData[0].rel_likes, 1);
          assert.equal(res.body.stockData[1].rel_likes, -1);
          done();
        });
    });
    it("5. Viewing two stocks and liking them: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock: ["GOOG", "MSFT"], like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData.length, 2);
          
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.isNumber(res.body.stockData[0].price);
          assert.isNumber(res.body.stockData[0].rel_likes);
          
          assert.equal(res.body.stockData[1].stock, "MSFT");
          assert.isNumber(res.body.stockData[1].price);
          assert.isNumber(res.body.stockData[1].rel_likes);
          
          // Both stocks should have equal likes now
          assert.equal(res.body.stockData[0].rel_likes, 0);
          assert.equal(res.body.stockData[1].rel_likes, 0);
          done();
        });
    });
  });
});