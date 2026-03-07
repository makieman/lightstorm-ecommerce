const mongoose = require("mongoose");

let cartSchema = new mongoose.Schema({
    "product": { type: mongoose.Schema.Types.ObjectId, ref: "products" },
    "quantity": Number
})

const UserSchema = new mongoose.Schema({
    "username": {
        type: String,
        required: true,
    },
    "password": {
        type: String,
        required: true,
    },
    "email": {
        type: String,
        unique: true,
        required: true,
    },
    "image": { type: String, default: "https://res.cloudinary.com/dh7osyxvl/image/upload/v1714489565/Users/pngwing.com_10_lnfy4w.png" },
    "isVerified": { type: Boolean, default: false },
    "verificationToken": { type: String, default: null },
    "verificationTokenExpiry": { type: Date, default: null },
    "passwordResetToken": { type: String, default: null },
    "passwordResetTokenExpiry": { type: Date, default: null },
    "passwordChangedAt": { type: Date, default: null },
    "orders": [{ type: mongoose.Schema.Types.ObjectId, ref: "orders" },],
    "carts": [cartSchema],
    "isAdmin": { type: Boolean, default: false }
})

module.exports = mongoose.model("users", UserSchema)