const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

const path = 'invoice';

router.post(`/${path}/create`, invoiceController.createInvoice);
router.post(`/${path}/getById`, invoiceController.getInvoiceById);
router.get(`/${path}/list`, invoiceController.getInvoiceList);

module.exports = router;
