import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }

});
userSchema.pre('save', async function (next) {
    //! This middleware runs only if the password is modified or new field is created 
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

//Instance Method
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // ! this.password will not be available as we have set select to false
    return await bcrypt.compare(candidatePassword, userPassword);

}

// Instance method to check if user has changed password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(this.passwordChangedAt, JWTTimeStamp);
        return JWTTimeStamp < changedTimeStamp // Lets say the token was issued at 100 and we changed the password 
        //after that at 200 so we want the passwrod changed to return true
    }
    // ! False means that password is not changed
    return false;
}
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}
export const User = mongoose.model('User', userSchema);