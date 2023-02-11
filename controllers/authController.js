import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { User } from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from '../utils/appError.js';
import { decode } from 'punycode';


const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

export const signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const token = signToken(newUser._id)
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));

    }
    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email: email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    //a console.log(user);

    // 3) If everything is Ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    })
});

// & Function to protect the routes => This is a middleware function

export const protect = catchAsync(async (req, res, next) => {
    console.log("Hellow from the protected route");
    // 1). Getting token and check if it exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        //console.log("Bye");
        token = req.headers.authorization.split(' ')[1];
        //console.log(req.headers.authorization.split(' ')[1]);
        //console.log(req.headers.authorization.split(' '));
        //console.log(token);
    }
    console.log(token);
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401));
    }
    // 2). Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);
    // 3). Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user belonging to the token no longer exist. ', 401));
    }
    // 4). Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed the password! Please log in again', 401))
    }
    req.user = freshUser;
    next();
})