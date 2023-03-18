import { Tour } from "../models/tourModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { User } from "../models/userModel.js";



export const getOverview = catchAsync(async (req, res) => {
    // 1) Get tour data from the collection
    // 2) Build the template
    const tours = await Tour.find();
    res.status(200).render('overview', {
        tours
    });
});

export const getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if (!tour) {
        return next(new AppError('There is no tour with that name', 404));
    }

    res.status(200)
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        })
});

export const getLogin = catchAsync(async (req, res) => {
    res
        .status(200)
        .render('login', {
            title: 'Log into your account'
        });

})


export const getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    })

}


export const updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        user: updatedUser  // & As the user coming from the protect route will not be the updated user

    })
})