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

// PDF route
// router.post('/salesHistory/pdf', salesHistoryReportController.generateReport);

router.post(`/${path}/pdf`, salesHistoryReportController.generatePDFReport);
router.post(`/${path}/xls`, salesHistoryReportController.generateXLSReport);
router.post(`/${path}/csv`, salesHistoryReportController.generateCSVReport);

module.exports = router;