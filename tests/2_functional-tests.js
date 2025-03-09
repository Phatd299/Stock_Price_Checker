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
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: "TSLA" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "TSLA");
          assert.exists(res.body.stockData.price, "TSLA has a price");
          assert.exists(res.body.stockData.likes, "TSLA has likes");
          done();
        });
    });
    it("2. Viewing one stock and liking it: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: "GOLD", like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "GOLD");
          assert.exists(res.body.stockData.price, "GOLD has a price");
          assert.equal(res.body.stockData.likes, 1);
          done();
        });
    });
    it("3. Viewing the same stock and liking it again: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: "GOLD", like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "GOLD");
          assert.exists(res.body.stockData.price, "GOLD has a price");
          assert.equal(res.body.stockData.likes, 1);
          done();
        });
    });
    it("4. Viewing two stocks: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: ["AMZN", "T"] })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, "AMZN");
          assert.equal(res.body.stockData[1].stock, "T");
          assert.exists(res.body.stockData[0].price, "AMZN has a price");
          assert.exists(res.body.stockData[1].price, "T has a price");
          assert.exists(res.body.stockData[0].rel_likes, "AMZN has rel_likes");
          assert.exists(res.body.stockData[1].rel_likes, "T has rel_likes");
          done();
        });
    });
    it("5. Viewing two stocks and liking them: GET request to /api/stock-prices/", function (done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("content-type", "application/json")
        .query({ stock: ["AMZN", "T"], like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, "AMZN");
          assert.equal(res.body.stockData[1].stock, "T");
          assert.exists(res.body.stockData[0].price, "AMZN has a price");
          assert.exists(res.body.stockData[1].price, "T has a price");
          assert.exists(res.body.stockData[0].rel_likes, "AMZN has rel_likes");
          assert.exists(res.body.stockData[1].rel_likes, "T has rel_likes");
          done();
        });
    });
  });
});