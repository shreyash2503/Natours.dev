import { Tour } from "../models/tourModel.js";
import { catchAsync } from "../utils/catchAsync.js";



export const getOverview = catchAsync(async (req, res) => {
    // 1) Get tour data from the collection
    // 2) Build the template
    const tours = await Tour.find();
    res.status(200).render('overview', {
        tours
    });
});

export const getTour = catchAsync(async (req, res) => {

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    res.status(200)
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        })
});