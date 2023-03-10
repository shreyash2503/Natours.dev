import { Review } from "../models/reviewModel.js";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./handlerFactory.js";


export const getAllReview = getAll(Review);
// catchAsync(async (req, res) => {


//     let features = new APIFeatures(Review.find(filter), req.query)
//         .filter()
//         .sorted()
//         .fieldLimiting()
//         .pagination();
//     const reviews = await features.query;

//     res.status(200).json({
//         status: 'success',
//         requestedAt: req.requestTime,
//         results: reviews.length,
//         data: {
//             reviews
//         }
//     })
// });

export const setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

// export const createReview = catchAsync(async (req, res) => {
//     //Allow nested routes

//     const review = await Review.create({
//         review: req.body.review,
//         rating: req.body.rating * 1,
//         user: req.body.user,
//         tour: req.body.tour
//     });
//     res.status(201).json({
//         status: 'success',
//         data: {
//             review
//         }
//     })

// })


export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);
export const getReview = getOne(Review);