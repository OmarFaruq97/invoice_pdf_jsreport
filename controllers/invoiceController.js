const DBCRUDService = require('../service/DBCRUDService');
const invoiceValidation = require('../validations/invoiceValidation');
const ResponseHandler = require('../utils/responseHandler');

// Stored procedure service
const invoiceService = new DBCRUDService('public', 'proc_invoice_crud');

// Create new Invoice
exports.create = async (req, res) => {
    try {
        // Validate input
        const validationError = invoiceValidation.validate(req.body);
        if (validationError) return ResponseHandler.error(res, validationError);

        // Call SP - DBCRUDService automatically adds 'action'
        const result = await invoiceService.create(req.body);
        ResponseHandler.success(res, result.data, result.msg);
        
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// Update Invoice
exports.update = async (req, res) => {
    try {
        const result = await invoiceService.update(req.body);
        ResponseHandler.success(res, result.data, result.msg);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// Delete Invoice
exports.delete = async (req, res) => {
    try {
        const result = await invoiceService.delete({ invoice_id: req.body.id });
        ResponseHandler.success(res, result.data, result.msg);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// Get Invoice by ID
exports.getById = async (req, res) => {
    try {
        const result = await invoiceService.getById({ invoice_id: req.body.id });
        ResponseHandler.success(res, result.data, result.msg);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

// Get Invoice list
exports.getList = async (req, res) => {
    try {
        const result = await invoiceService.getList(req.body);
        ResponseHandler.success(res, result.data, result.msg);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

/*const DBCRUDService = require('../service/DBCRUDService');
const invoiceValidation = require('../validations/invoiceValidation');
const ResponseHandler = require('../utils/responseHandler');

// Stored procedure service
const invoiceService = new DBCRUDService('public', 'proc_invoice_crud');

exports.create = async (req, res) => {
    const data = { ...req.body, action_mode: 'insert' };

    try {
        // Validate input
        const validationError = invoiceValidation.validate(data);
        if (validationError) return ResponseHandler.error(res, validationError);

        // Call SP
        const result = await invoiceService.create(data);

        
        res.json(result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

exports.getById = async (req, res) => {
    const data = { action_mode: 'getById', invoice_id: req.body.id };

    try {
        const result = await invoiceService.getById(data);
        res.json(result); // SP result direct
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

exports.getList = async (req, res) => {
    const data = { action_mode: 'getList' };

    try {
        const result = await invoiceService.getList(data);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

exports.delete = async (req, res) => {
    const data = { action_mode: 'delete', product_id: req.body.id };

    try {
        const result = await productService.delete(data);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};


exports.update = async (req, res) => {
    const data = { ...req.body, action_mode: 'update' };

    try {
        const result = await productService.update(data);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};*/