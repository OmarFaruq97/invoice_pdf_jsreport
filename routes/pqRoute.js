const express = require('express');
const router = express.Router();
const pqController = require('../controllers/pqController');

const path = 'pq';

router.post(`/${path}/create`, pqController.create);
router.post(`/${path}/getById`, pqController.getById);
router.post(`/${path}/list`, pqController.getList);
router.post(`/${path}/update`, pqController.update);
router.post(`/${path}/delete`, pqController.delete);    

module.exports = router;