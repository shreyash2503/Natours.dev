// import fs from 'fs';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
import { Tour } from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))
import { createOne, deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';

export const getAllTours = getAll(Tour);


//Craete a checkBody middleware
// ! Check if body contains the name and price property
// ! If not, send back 400 (bad request)
// ! Add it to the post handler stack
export const checkBody = ((req, res, next) => {
    return req.body.price && req.body.name ? next() : res.status(400).json({
        status: 'fail',
        message: 'Invalid data sent!'
    })
})

//Middleware for aliasing top 5 cheap and best tours

export const aliasTopTours = ((req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';

    next();
})


// export const createTour = catchAsync(async (req, res, next) => {
//     //console.log(req.body);
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour
//         }
//     })

// })

export const createTour = createOne(Tour);


export const getTour = getOne(Tour, { path: 'reviews' })

// catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews');
// .populate({
//     path: 'guides',
//     select: '-_v -passwordChangedAt'
// })// The documents that are referenced will be populated but only in the query response not in actual database;
//     if (!tour) {
//         return next(new AppError('No tour found with that id ', 404));
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     })
// })

// export const updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findOneAndUpdate({ _id: req.params.id }, req.body, {
//         new: true,
//         runValidators: true
//     })
//     if (!tour) {
//         return next(new AppError('No tour found with that id ', 404));
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour: tour
//         }
//     })
// })

export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);




// export const deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//         return next(new AppError('No tour found with that id ', 404));
//     }
//     res.status(204).json({
//         status: 'success',
//     })
// })

export const getTourStats = catchAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numRating: { $sum: '$ratingsQuantity' },
                numTours: { $sum: 1 },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})
// ! All the stages are executed sequentically;
export const getMonthlyPlan = catchAsync(async (req, res) => {
    const year = req.params.year * 1; //2021
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates' //! Stage one of the pipeline
        },
        {
            $match: {  // ! Stage two of the pipeline
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: { // ! Stage three of the pipeline
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        { // ! Stege four of the pipeline
            $addFields: { month: '$_id' }
        },
        { // ! Stage five of the pipeline
            $project: {
                _id: 0
            }
        },
        { // ! Stage six of the pipeline
            $sort: { numTourStarts: -1 }
        },
        { // ! Srage seven of the pipelin
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});


//latitude and longitude
export const getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) {
        next(new AppError("Please provide latitude and longitude in the format lat,lng ", 400));
    }
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

export const getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
        next(new AppError('Pleases provide latitude and longitude in the format lat,lng'));
    };

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier  // * => Convert the distance to kilometer

            }                     // $geoNear always needs to be the first stage in aggregation pipline
            // The field we are quering with $geoNear must be a geospatial index
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        results: distances.length,
        data: {
            data: distances
        }
    })
})





