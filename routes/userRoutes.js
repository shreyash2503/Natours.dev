import express from 'express';
import { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe, uploadUserPhoto, resizeUserPhoto } from '../controllers/userController.js';
import { forgotPassword, login, logout, protect, resetPassword, restrictTo, signUp, updatePassword } from '../controllers/authController.js';




const Router = express.Router();

Router.post('/signup', signUp);
Router.post('/login', login);
Router.get('/logout', logout)
Router.post('/forgotPassword', forgotPassword);
Router.patch('/resetPassword/:token', resetPassword);


Router.use(protect); // ! Protect all the routes that come after this point


Router.patch('/updatePassword', updatePassword);
Router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe)
Router.delete('/deleteMe', deleteMe);
Router.get('/me', getMe, getUser);


// Below routes are for the admin to update

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


