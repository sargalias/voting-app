const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    title: {type: String, required: true},
    results: [{
        option: {type: String, required: true},
        votes: {type: Number, default: 0, required: true}
    }],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    created_at: {type: Date, default: Date.now, required: true}
});

PollSchema.methods.containsOption = function(option) {
    for (let result of this.results) {
        if (result.option === option) {
            return true;
        }
    }
    return false;
};

PollSchema.methods.voteForOption = function(option) {
    for (let result of this.results) {
        if (result.option === option) {
            result.votes++;
        }
    }
    return false;
};

module.exports = mongoose.model('Poll', PollSchema);