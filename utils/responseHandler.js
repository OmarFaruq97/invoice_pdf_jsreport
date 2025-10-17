class ResponseHandler {
    // Success response
    static success(res, data = null, message = 'Success', status = 200) {
        return res.status(status).json({
            success: true,
            msg: message,
            data: data
        });
    }

    // Error response
    static error(res, message = 'Internal Server Error', status = 400) {
        return res.status(status).json({
            success: false,
            msg: message,
            data: null
        });
    }
}

module.exports = ResponseHandler;
 