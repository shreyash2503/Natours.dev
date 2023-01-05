import fs from 'fs';
import { Tour } from '../../models/tourModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
//console.log("Hello" + process.env.DATABASE);
mongoose
    .connect(process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD), { useNewUrlParser: true })
    .then(() => console.log('DB connection successful'));

// READ JSON FILE
const toursApi = fs.readFileSync('tours-simple.json', 'utf-8');
const tours = JSON.parse(fs.readFileSync('tours-simple.json', 'utf-8'));
console.log(toursApi);

//IMPORT DATA INTO DATABASE

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded');

    } catch (err) {
        console.log(err)
    }
}

//DELETION ALL DATA FROM DATABASE
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted');
    } catch (err) {
        console.log(err);
    }
}
console.log(process.argv);