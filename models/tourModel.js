import mongoose from 'mongoose';
import slugify from 'slugify';
//import validator from 'validator';
//import { User } from './userModel.js';

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour name must have less or equal than 40 characters'],
        minLenght: [10, 'A tour name must have more than 10 characters'],
        //validate: [validator.isAlpha, 'Tour name can only contain characters']
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
        required: [true, 'A tour must have a difficulty'], // ! If the difficulty value is not provided then the second array object is given as a error
        enum: ['easy', 'medium', 'difficult']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be greater than 1'],
        max: [5, 'Rating must be less than 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate:
        {
            validator: function (val) {
                // this only points to current doc on NEW document creation
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) must less than the actual price'
        }
    },
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
    slug: String,
    secretTour: {
        type: Boolean,
        default: false

    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});


// ! Virtual Populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})
// ! Document Middleware
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
// & The post middleware does not work with insertMany() it only works with .save() and .create();
// & Multiple hooks are available apart from save i.e remove, delete etc;
tourSchema.post('save', function (doc, next) {
    //console.log(doc);
    next();
});

// ! Code for embedding documents manually

// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next();
// })



//Query Middleware
tourSchema.pre(/^find/, function (next) { // ! the ^ is used to find the word specified after it in the beigining of the sentence (Regex)
    // console.log(this.find());
    this.find({ secretTour: { $ne: true } }) // ! $ne is the not equal to operator
    this.populate({
        path: 'guides',
        select: '-_v -passwordChangedAt'
    });
    this.start = Date.now();
    next();
});
tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`)
    //console.log(docs);
    next();
})
// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // ! This will hide the secret Tours in aggregation pipeline
    // console.log(this);
    next();
})


export const Tour = mongoose.model('Tour', tourSchema);