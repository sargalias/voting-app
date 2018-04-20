const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    polls: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Poll"
        }
    ],
    googleId: {type: String, required: true}
});

module.exports = mongoose.model('User', UserSchema);
