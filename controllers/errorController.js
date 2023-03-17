import AppError from './../utils/appError.js'

const sendErroDev = (err, req, res) => {
    // API
    console.log(req.originalUrl);
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        });
    } else {
        // RENDERED WEB
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
    }
}

const handleJWTError = () => new AppError('Invalid token. Please login again', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please login again', 401);
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${value}, Please use another value!`
    return new AppError(message, 400);
    // How to find text between double quotes using regex 
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data, ${errors.join('. ')}`;
    return new AppError(message, 400);
}
const sendErrorProd = (err, req, res) => {
    //A) Opertional , trusted error : send message to client
    // API
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
            //! Programming or other unknown error
        }
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })

    }
    //B) RENDERED WEBSITE
    if (err.isOperational) {
        res.status(err.statusCode).json({
            title: 'Something went wrong!',
            msg: err.message
        })
        //! Programming or other unknown error
    } else {
        res.status(500).json({
            status: 'error',
            msg: 'Please try again later'
        })
    }


}

export const globalErrorHandler = (err, req, res, next) => {
    console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErroDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, req, res);
    }

}