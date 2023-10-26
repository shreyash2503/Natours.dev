import { promisify } from 'util';
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken';
import { User } from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from '../utils/appError.js';
import { Email } from '../utils/email.js';


const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        //secure: true, // ! The cookie will be send only if the connection is HTTPs
        httpOnly: true // ! The browser cannot manipulate the cookie
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    user.password = undefined; // We dont want the response of the route to contain the password
    // so we make it undefined but note we are not saving the user so changes will not occur actually
    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

export const signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
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
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
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
    res.locals.user = freshUser;
    next();
})

// Only for rendered pages, no errors
export const isLoggedIn = catchAsync(async (req, res, next) => {
    // 1). Getting token and check if it exists
    let token;
    console.log("hello from protected route");
    if (req.cookies.jwt) {
        try {
            token = req.cookies.jwt;
            // 2). Verification of token
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            //console.log(decoded);
            // 3). Check if user still exists
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next();
            }
            // 4). Check if user changed password after the token was issued
            if (freshUser.changedPasswordAfter(decoded.iat)) {
                return next()
            }
            // A logged in user already exists
            res.locals.user = freshUser;
            return next();
        } catch (e) {
            return next();
        }
    }
    next();
});



export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform the action', 403));
        }
        next();
    }

}


export const forgotPassword = catchAsync(async (req, res, next) => {
    // ! 1) Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404));
    }
    // ! 2). Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // ! 3). Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}}`;
    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to :${resetURL}.\nIf you didn't forget your password, please ignore this email`;
    try {
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Your password reset token (valid for 10 min)',
        //     message
        // });
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'Token sent to the email'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false })
        return next(new AppError('There was an error sending the email. Try again later', 500));
    }
})
export const resetPassword = catchAsync(async (req, res, next) => {
    //1) get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    //2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400)); // 400 Indicates bad request

    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3) Update changedPasswordAt property for the use 
    //Done int the userModel.js as a pre save middleware 
    //4) Log the user in, send JWT
    createSendToken(user, 200, res);
}
);

export const updatePassword = catchAsync(async (req, res, next) => {
    //1) Get user from the collection

    //2) Check if posted current password is correct
    //3) If so, update the password
    //4) Log user in, send JWT
    // let token1;
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //     token1 = req.headers.authorization.split(' ')[1];
    // }
    // if (!token1) {
    //     return next(new AppError('You are not logged in! Please log in and try again'));
    // }
    // console.log({ token1 });
    // const decoded = await promisify(jwt.verify)(token1, process.env.JWT_SECRET);
    // if (!decoded) {
    //     return next(new AppError('The token is expired or wrong! Please log in and try again'));
    // }
    // console.log({ decoded });
    // const foundUser = await User.findById(decoded.id).select('+password');
    // console.log(foundUser);
    // if (!foundUser) {
    //     return next(new AppError('The user does not exists! Please log in and try again1'));
    // }
    // if (foundUser.changedPasswordAfter(decoded.iat)) {
    //     return next(new AppError('The user recently changed the password or you have typed a wrong password'))
    // }
    // console.log({ foundUser });
    const foundUser = await User.findById(req.user._id).select('+password');
    //2) Check if posted current password is correct
    const isCorrect = bcrypt.compare(req.body.password, foundUser.password);
    if (!isCorrect) {
        return next(new AppError('The current password you have entered is not correct', 401));
    }
    foundUser.password = req.body.newPassword;
    foundUser.passwordConfirm = req.body.confirmPassword;
    await foundUser.save();
    const token = signToken(foundUser._id);
    res.status(200).json({
        status: 'success',
        token
    })
});


export const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    })
}

