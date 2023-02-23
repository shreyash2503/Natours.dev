import express from 'express';
import { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe } from '../controllers/userController.js';
import { forgotPassword, login, protect, resetPassword, restrictTo, signUp, updatePassword } from '../controllers/authController.js';

//? Routes
const Router = express.Router();

Router.post('/signup', signUp);
Router.post('/login', login);
Router.post('/forgotPassword', forgotPassword);
Router.patch('/resetPassword/:token', resetPassword);
Router.post('/updatePassword', protect, updatePassword);
Router.patch('/updateMe', protect, updateMe)
Router.delete('/deleteMe', protect, deleteMe)
Router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

Router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);



export default Router;
