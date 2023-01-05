import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
dotenv.config({ path: './config.env' });
//console.log("Hello" + process.env.DATABASE);
mongoose
    .connect(process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD), { useNewUrlParser: true })
    .then(() => console.log('DB connection successful'));

app.listen(9000 || process.env.PORT, () => {
    console.log("Server started at port 9000")
})