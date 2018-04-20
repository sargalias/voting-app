const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    title: {type: String, required: true},
    results: [{
        option: {type: String, required: true},
        votes: {type: Number, required: true}
    }],
    url: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

module.exports = mongoose.model('Poll', PollSchema);