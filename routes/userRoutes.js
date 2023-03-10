import express from 'express';
import { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe } from '../controllers/userController.js';
import { forgotPassword, login, logout, protect, resetPassword, restrictTo, signUp, updatePassword } from '../controllers/authController.js';

//? Routes
const Router = express.Router();

Router.post('/signup', signUp);
Router.post('/login', login);
Router.get('/logout', logout)
Router.post('/forgotPassword', forgotPassword);
Router.patch('/resetPassword/:token', resetPassword);


Router.use(protect); // ! Protect all the routes that come after this point


Router.post('/updatePassword', updatePassword);
Router.patch('/updateMe', updateMe)
Router.delete('/deleteMe', deleteMe);
Router.get('/me', getMe, getUser);

Router.use(restrictTo('admin'))
Router
    .route('/')
    .get(protect, getAllUsers)
    .post(createUser);

Router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default Router;


