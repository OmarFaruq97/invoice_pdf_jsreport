const express = require('express');
const router = express.Router();
const invoiceHistoryController = require('../controllers/salesHistoryController');

const path = 'invoiceHistory';

router.post(`/${path}/create`, invoiceHistoryController.create);
router.post(`/${path}/getById`, invoiceHistoryController.getById);
router.post(`/${path}/list`, invoiceHistoryController.getList);
router.post(`/${path}/update`, invoiceHistoryController.update);
router.post(`/${path}/delete`, invoiceHistoryController.delete);

module.exports = router;