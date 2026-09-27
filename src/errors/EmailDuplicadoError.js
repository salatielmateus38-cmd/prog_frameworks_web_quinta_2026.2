const ApiError = require("./ApiError");

class EmailDuplicadoError extends ApiError{
    constructor(message = "Email já cadastrado", statusCode = 409){
        super(message, statusCode);
    }
}

module.exports = EmailDuplicadoError;
