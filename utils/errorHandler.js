// utils/ErrorHandler.js

class ErrorHandler extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // stack trace capture
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;
