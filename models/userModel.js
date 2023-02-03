import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide a valid email'],
        validate: [validator.isEmail, 'Please provide a valid email'],
        unique: [true, 'Email already exists'],
        lowercase: true
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        minlength: 8,
        validate: {
            /// This will only work on save
            /// So while updating password we cannot use findOneAndUpdate
            validator: function (val) {
                return val === this.password
            },
            message: 'Confirm Password should match to password'
        }
    },

});
userSchema.pre('save', async function (next) {
    //! This middleware runs only if the password is modified or new field is created 
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

//Instance Method
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // ! this.password will not be available as we have set select to false
    return await bcrypt.compare(candidatePassword, userPassword);

}
export const User = mongoose.model('User', userSchema);