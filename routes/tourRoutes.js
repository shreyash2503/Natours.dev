import express from 'express';
import fs from 'fs';
import { getAllTours, createTour, updateTour, deleteTour, getTour, checkBody, aliasTopTours, getTourStats, getMonthlyPlan } from '../controllers/tourController.js';


const Router = express.Router();
Router.param('id', (req, res, next, val) => {
    console.log(`Tour id is ${val}`);
    next();
})

Router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

Router
    .route('/tour-stats')
    .get(getTourStats);

Router
    .route('/monthly-plan/:year')
    .get(getMonthlyPlan);

Router
    .route('/')
    .get(getAllTours)
    .post(checkBody, createTour);

Router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

export default Router;