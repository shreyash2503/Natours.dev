import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import { createReview, deleteReview, getAllReview, getReview, setTourUserIds, updateReview } from '../controllers/reviewController.js';

const Router = express.Router({ mergeParams: true });

Router.use(protect);

Router
    .route('/')
    .get(protect, getAllReview)
    .post(protect, restrictTo('user'), setTourUserIds, createReview);


Router
    .route('/:id')
    .get(getReview)
    .patch(restrictTo('user', 'admin'), updateReview)
    .delete(restrictTo('user', 'admin'), deleteReview)

export default Router;

