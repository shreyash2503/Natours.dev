import express from 'express';
import { getAllTours, createTour, updateTour, deleteTour, getTour, checkBody, aliasTopTours, getTourStats, getMonthlyPlan, getToursWithin, getDistances, uploadTourImages, resizeTourImages } from '../controllers/tourController.js';
import { protect, restrictTo } from '../controllers/authController.js';
import reviewRouter from './reviewRoutes.js';
const Router = express.Router();
Router.param('id', (req, res, next, val) => {
    console.log(`Tour id is ${val}`);
    next();
})


Router.use('/:tourId/reviews', reviewRouter);


Router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

Router
    .route('/tour-stats')
    .get(getTourStats);

Router
    .route('/monthly-plan/:year')
    .get(
        protect,
        restrictTo('admin', 'lead-guide', 'guide'),
        getMonthlyPlan
    );


Router
    .route('/distances/:latlng/unit/:unit')
    .get(getDistances)

Router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin)


Router
    .route('/')
    .get(protect, getAllTours)
    .post(protect, restrictTo('admin', 'lead-guide'), checkBody, createTour);

Router
    .route('/:id')
    .get(getTour)
    .patch(
        protect,
        restrictTo('admin', 'lead-guide'),
        uploadTourImages,
        resizeTourImages,
        updateTour
    )
    .delete(
        protect,
        restrictTo('admin', 'lead-guide'),
        deleteTour
    );



export default Router;
