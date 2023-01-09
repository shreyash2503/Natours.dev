import mongoose from 'mongoose';
import slugify from 'slugify';

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have duration ']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    slug: String
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// & The pre middleware is executed before the .save() and .create() methods
// & Writing the pre middleware
// & This is a document middleware, but it does not work with insertMany() it only works with .save() and .create();
// & WE can have multiple pre middlewares
// & Here we are using the save hook
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();

});

// & The post middleware
// & The post middleware is executed after the .save() and .create() methods

tourSchema.post('save', function (doc, next) {
    console.log(doc);
    next();
})


export const Tour = mongoose.model('Tour', tourSchema);