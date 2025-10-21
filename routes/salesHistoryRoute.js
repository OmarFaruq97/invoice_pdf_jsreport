//routes/salesHistoryRoute.js

const express = require('express');
const router = express.Router();
const invoiceHistoryController = require('../controllers/salesHistoryController');
const salesHistoryReportController = require('../controllers/salesHistoryReportController');

const path = 'salesHistory';

router.post(`/${path}/create`, invoiceHistoryController.create);
router.post(`/${path}/getById`, invoiceHistoryController.getById);
router.post(`/${path}/list`, invoiceHistoryController.getList);
router.post(`/${path}/update`, invoiceHistoryController.update);
router.post(`/${path}/delete`, invoiceHistoryController.delete);

// Single endpoint for all report formats
router.post(`/${path}/report`, salesHistoryReportController.generateReport);

module.exports = router;