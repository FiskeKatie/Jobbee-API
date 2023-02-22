const ErrorHandler = require('../utils/errorHandler');


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    if(process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success : false,
            error : err,
            errMessage : err.message,
            stack : err.stack
        })
    }

    if(process.env.NODE_ENV === 'Production ') {
        let error = {...err};

        error.message = err.message;

        //Wrong mongoose object ID error
        if(err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${error.path}`;
            error = new ErrorHandler(message, 404);
        }

        //Handling Mongoose validation error
        if(err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 400);
        }

        //Handling mongoose duplicate key error
        if(err.code === 11000) {
            const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
            error = new ErrorHandler(message, 400);
        }

        //Handling wrong JWT token error
        if(err.name === 'JsonWebTokenError') {
            const message = 'JSON web token is invalid. Try Again!';
            error = new ErrorHandler(message, 500);
        }

        //Handling Expired JWT token error
        if(err.name === 'TokenExpiredError') {
            const message = "JSON web token is expired. Try again!";
            error = new ErrorHandler(message, 500);
        }

        res.status(error.statusCode).json({
            success : false,
            message : error.message || 'Internal Server Error.'
        })
    }

}