const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please enter your name.']
    },
    email : {
        type : String,
        required : [true, 'Please enter your email address.'],
        unique : true,
        validate : [validator.isEmail, 'Please enter vaild email address.']
    },
    role : {
        type : String,
        enum : {
            values : ['user', 'employeer'],
            message : 'Please select correct role'
        },
        default : 'user'
    },
    password : {
        type : String,
        required : [true, 'Please enter a password for your account.'],
        minlength : [8, 'Your password must be at least 8 characters long. '],
        select : false
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },
    resetPasswordToken : String,
    resetPasswordExpired : Date
});

//Encyprting passwords before saving
userSchema.pre('save', async function(next) {

    if(!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10)
});

//return json web token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({id : this._id}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRE_TIME
    });
}

//compare user password in databse password
userSchema.methods.comparePassword = async function(enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
}

//Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function() {
    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Hash and set to resetpasswordToken
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // set token Expire time
    this.resetPasswordExpired = Date.now() + 30*60*1000;

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);