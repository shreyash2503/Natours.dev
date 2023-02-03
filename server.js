import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
dotenv.config({ path: './config.env' });
//console.log("Hello" + process.env.DATABASE);

process.on('uncaughtException', err => {
    console.log('UNHANDLED EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
mongoose
    .connect(process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD), { useNewUrlParser: true })
    .then(() => console.log('DB connection successful'));

const server = app.listen(9000 || process.env.PORT, () => {
    console.log("Server started at port 9000")
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLER REJECTION! Shutting down...');
    server.close(() => {
        process.exit(1);
    })
});
