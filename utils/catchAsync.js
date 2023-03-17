
export const catchAsync = fn => {
    return (req, res, next) => { // here req, res and next are passed by express by default
        fn(req, res, next).catch(err => next(err));
    }
}