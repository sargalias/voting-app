const mongoose = require('mongoose');

const AnonymousSchema = new mongoose.Schema({
    pollsVotedFor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Poll"
        }
    ],
    ipAddress: {type: String, required: true}
});

module.exports = mongoose.model('Anonymous', AnonymousSchema);
