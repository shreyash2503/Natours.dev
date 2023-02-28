import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";

export const deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that id ', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
});
export const updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true
    })
    if (!doc) {
        return next(new AppError('No document found with that id ', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
});

export const createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

export const getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
        query = query.populate(popOptions);
    }
    const doc = await query;
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })


})

export const getAll = Model => catchAsync(async (req, res) => {

    //?BUILD A QUERY AND THEN WE EXECUTE THE QUERY
    // ! To allow for nested GET reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }
    // 1A) Filtering
    let features = new APIFeatures(Model.find(filter), req.query)
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
    const docs = await features.query;
    // const tours = Tour.find()
    //     .where('duration')
    //     .equals(5)
    //     .where('difficulty')
    //     .equals('easy');


    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: docs.length,
        data: {
            data: docs
        }
    })
})




