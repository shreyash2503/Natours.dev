import fs from 'fs';
import { Tour } from '../../models/tourModel.js';
import { User } from '../../models/userModel.js';
import { Review } from '../../models/reviewModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { fileURLToPath } from 'url';
import { dirname } from 'path';
dotenv.config({ path: '../../config.env' });
//console.log("Hello" + process.env.DATABASE);
mongoose
    .connect(process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD), { useNewUrlParser: true })
    .then(() => console.log('DB connection successful'));

// READ JSON FILE
// const toursApi = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
// console.log(toursApi);

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

//IMPORT DATA INTO DATABASE

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data successfully loaded');
        process.exit();
    } catch (err) {
        console.log(err)
    }
}

//DELETION ALL DATA FROM DATABASE
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}
if (process.argv[2] === '--import') {
    importData();
}
else if (process.argv[2] === '--delete') {
    deleteData();
}
console.log(process.argv);