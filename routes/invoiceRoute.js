const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const invoicePDFController = require('../controllers/invoicePDFController');

const path = 'invoice';

router.post(`/${path}/create`, invoiceController.create);
router.post(`/${path}/getById`, invoiceController.getById);
router.post(`/${path}/list`, invoiceController.getList);

// PDF route
router.post('/invoice/pdf', invoicePDFController.generateInvoicePDF);

module.exports = router;
