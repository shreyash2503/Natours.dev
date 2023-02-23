import mongoose from "mongoose";
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

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})

export const Review = mongoose.model('Review', reviewSchema);