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
router.post('/salesHistory/pdf', salesHistoryReportController.generateReport);



module.exports = router;