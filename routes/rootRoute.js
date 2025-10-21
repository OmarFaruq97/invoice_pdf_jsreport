const express = require("express");
const ErrorHandler = require("../utils/errorHandler");

// Import routes
const invoiceRoute = require("./invoiceRoute");
const invoiceHistoryRoute = require("./salesHistoryRoute");
const pqRoute = require("./pqRoute");


const route = (app) => {

  // Static files
  app.use(express.static("public/uploads"));

  const apiPath = "/api/v1";

  // API routes
  app.use(apiPath, invoiceRoute);
  app.use(apiPath, invoiceHistoryRoute);
  app.use(apiPath, pqRoute);




  // 404 handler (catch-all)
  app.use((req, res, next) => {
    next(new ErrorHandler(`Can't find ${req.originalUrl} on this server!`, 404));
  });
};

module.exports = route;
