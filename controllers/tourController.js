import express, { query } from 'express';
// import fs from 'fs';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
import { Tour } from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


export const getAllTours = async (req, res) => {
    try {
        //?BUILD A QUERY AND THEN WE EXECUTE THE QUERY

        // 1A) Filtering
        let features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sorted()
            .fieldLimiting()
            .pagination();
        // 2) sORTING
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     console.log(sortBy);
        //     query = query.sort(sortBy);
        // } else {
        //     query = query.sort('-__v');
        // }

        // 3) Field limiting
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }


        // 4)Pagination
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;
        // // page=2&limit=10, 1-10 page1, 11-20 page2, 21-30 page3
        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip >= numTours) throw new Error('This page does not exist');
        // }
        //{difficulty: 'easy', duration:{$gte:5}}
        // EXECUTE QUERY
        const tours = await features.query;
        // const tours = Tour.find()
        //     .where('duration')
        //     .equals(5)
        //     .where('difficulty')
        //     .equals('easy');


        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

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


export const createTour = async (req, res) => {
    //console.log(req.body);
    try {

        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }

}

export const getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

export const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })

    }

}

export const deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
        })

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

export const getTourStats = async (req, res) => {
    try {
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

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}

export const getMonthlyPlan = async (req, res) => {
    try {
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
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            data: {
                message: err
            }
        })

    }
}



