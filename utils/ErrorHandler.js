 
class errorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // Capture the stack trace properly
        Error.captureStackTrace(this, this.constructor);
    }
}

export { errorHandler };


