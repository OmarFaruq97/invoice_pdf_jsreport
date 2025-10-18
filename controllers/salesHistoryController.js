const DBCRUDService = require('../service/DBCRUDService');
const ResponseHandler = require('../utils/responseHandler');
const salesHistoryValidation = require('../validations/salesHistoryValidation');

// Stored procedure service
const salesService = new DBCRUDService('public', 'proc_sales_history_crud');

exports.create = async (req, res) => {
    const data = { ...req.body, action_mode: 'insert' };

    try {
        // Validate input
        const validationError = salesHistoryValidation.validate(data);
        if (validationError) return ResponseHandler.error(res, validationError);

        // Call SP
        const result = await salesService.create(data);

        
        res.json(result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

exports.getById = async (req, res) => {
    const data = { action_mode: 'getById', sale_id: req.body.id };

    try {
        const result = await salesService.getById(data);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

exports.getList = async (req, res) => {
    const data = { action_mode: 'getList' };

    try {
        const result = await salesService.getList(data);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

exports.update = async (req, res) => {
    const data = { ...req.body, action_mode: 'update' };

    try {
        const result = await salesService.update(data);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    const data = { action_mode: 'delete', sale_id: req.body.id };

    try {
        const result = await salesService.delete(data);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};
