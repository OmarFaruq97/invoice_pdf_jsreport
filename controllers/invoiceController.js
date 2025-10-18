const DBCRUDService = require('../service/DBCRUDService');
const invoiceValidation = require('../validations/invoiceValidation');
const ResponseHandler = require('../utils/responseHandler');

// Stored procedure service
const invoiceService = new DBCRUDService('public', 'proc_invoice_crud');


exports.createInvoice = async (req, res) => {
    const data = { ...req.body, action_mode: 'insert' };


    try {
        const validationError = invoiceValidation.validate(data);
        if (validationError) return ResponseHandler.error(res, validationError);

        const result = await invoiceService.create(data);
        res.json(result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

exports.getInvoiceById = async (req, res) => {
    const data = { action_mode: 'getById', invoice_id: req.body.id };

    try {
        const result = await invoiceService.getById(data);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};

exports.getInvoiceList = async (req, res) => {
    const data = { action_mode: 'getList' };

    try {
        const result = await invoiceService.getList(data);
        ResponseHandler.success(res, result);
    } catch (err) {
        ResponseHandler.error(res, err.message);
    }
};
