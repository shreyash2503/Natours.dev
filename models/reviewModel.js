import mongoose from "mongoose";
import { Tour } from "./tourModel.js";


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review must have a description'],
        maxLength: [200, 'The review must be less than 200 characters'],
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: [1, 'The rating must be greater than 1'],
        max: [5, 'The rating must be greater than 5']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }) // Each user of tour and user has to be unique


reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})



reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }

};

reviewSchema.post('save', function () {
    // This points to current review
    this.constructor.calcAverageRatings(this.tour);   // We use this.constructor as Review is not defined yet 
    // Also if we put this code below the Review declaration then it will not work as we defining a pre save after the model is created
    // this.contructor is the model that created this document

})
// There is no document middleware for findByIdAndUpdate and findByIdAndDelete 
// So use the following trick
// The above ratingsAverage works only when new review is created but when a review is updated or deleted
// we can do the following

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.model.findOne(this.getQuery()); // Refer the docs for this
    //console.log(this.r);
    next();
})
reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.tour);
})


export const Review = mongoose.model('Review', reviewSchema);