import express, { query } from 'express';
// import fs from 'fs';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
import { Tour } from '../models/tourModel.js';

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        console.log("I was called");
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);
        // 2) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        console.log(JSON.parse(queryStr))
        //let query = Tour.find(JSON.parse(queryStr)); // ! find method returns a query
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sorted() {
        console.log("I was called");
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-__v');
        }
        return this;
    }
    fieldLimiting() {
        console.log("I was called");
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        return this;
    }
    pagination() {
        console.log("I was called");
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        // page=2&limit=10, 1-10 page1, 11-20 page2, 21-30 page3
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

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





