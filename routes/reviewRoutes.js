import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import { createReview, deleteReview, getAllReview, setTourUserIds, updateReview } from '../controllers/reviewController.js';

const Router = express.Router({ mergeParams: true });

Router
    .route('/')
    .get(protect, getAllReview)
    .post(protect, restrictTo('user'), setTourUserIds, createReview);


Router
    .route('/:id')
    .patch(updateReview)
    .delete(deleteReview)

export default Router;

