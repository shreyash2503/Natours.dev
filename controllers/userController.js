import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js ';
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';
import multer from 'multer';
import sharp from 'sharp';


// configuring multer
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');

//     },
//     filename: (req, file, cb) => {
//         // user-userid-3232332323.jpeg
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);

//     }
// })
const multerStorage = multer.memoryStorage();
// * Here file is nothing but req.file that will be generated when we add the multer middleware
/* 
1)The reason that we removed the diskStorage function and added the memory storage function is =>
    a). We need the resize the image everytime the user uploads one and to do this the image must be present in the RAM of the server
    b). This is what memoryStorage does, it stores the image in the server's memory in the form of a Buffer(A small heap assigned to Binary data that can be manipulated)
    c). Remeber that the memoryStorage does not persist the images in the server like the diskStorage function
    d). You need to save the image manually
    e). If you use the diskStorage the req.file.filename will be automatically assigned but for saving the image you need to assign 
        the req.file.filename manually which is done in the <resizeUserPhoto> function here
*/

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images', 400), false);
    }
}


const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

export const uploadUserPhoto = upload.single('photo');

//// ----------------------------------->

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
}



export const resizeUserPhoto = (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; // refined the req.file.filename as we removed the diskStoreage code
    sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);
    next();
}

export const updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTS password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updatePassword', 400));

    }
    // 2) Update user document
    const filteredBody = filterObj(req.body, 'name', 'email');
    //& We need to store the file name of the photo the user uploaded in the user document below we are doing that
    if (req.file) filteredBody.photo = req.file.filename; // * console.log(req.file) to see in more detail

    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true })
    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });

})

export const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}



export const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
    res.status(204).json({
        status: 'success',
        data: null
    })
})




export const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    })

}
export const getUser = getOne(User);
export const getAllUsers = getAll(User);
// Do Not update password with this!
export const updateUser = updateOne(User);

export const deleteUser = deleteOne(User);