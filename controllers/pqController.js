const DBCRUDService = require('../service/DBCRUDService');
const ResponseHandler = require('../utils/responseHandler');

const pqService = new DBCRUDService('public', 'proc_pq_crud');

// Create new PQ
exports.create = async (req, res) => {
    try {
        const result = await pqService.create(req.body);
        
        // Directly return the result from stored procedure
        ResponseHandler.success(res, result.data, result.msg);
        
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// Update PQ
exports.update = async (req, res) => {
    try {
        const result = await pqService.update(req.body);
        ResponseHandler.success(res, result.data, result.msg);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// Delete PQ
exports.delete = async (req, res) => {
    try {
        const result = await pqService.delete({ pq_id: req.body.id });
        ResponseHandler.success(res, result.data, result.msg);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// Get PQ by ID
exports.getById = async (req, res) => {
    try {
        const result = await pqService.getById({ pq_id: req.body.id });
        ResponseHandler.success(res, result.data, result.msg);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// Get PQ list
exports.getList = async (req, res) => {
    try {
        const result = await pqService.getList(req.body);
        ResponseHandler.success(res, result.data, result.msg);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};
