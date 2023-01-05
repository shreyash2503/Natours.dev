import express from 'express';
import morgan from 'morgan';
const app = express();

import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { fileURLToPath } from 'url';
import { dirname } from 'path';
//Middleware
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    console.log("Hello from the middleware😎😎");
    next();
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})




app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

export default app;