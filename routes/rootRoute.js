const express = require("express");
const ErrorHandler = require("../utils/errorHandler");

// Import routes
const invoiceRoute = require("./invoiceRoute");

const route = (app) => {

  // Static files
  app.use(express.static("public/uploads"));

  const apiPath = "/api/v1";

  // API routes
  app.use(apiPath, invoiceRoute);

  // 404 handler (catch-all)
  app.use((req, res, next) => {
    next(new ErrorHandler(`Can't find ${req.originalUrl} on this server!`, 404));
  });
};

module.exports = route;
