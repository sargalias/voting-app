const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    polls: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Poll"
        }
    ],
    pollsVotedFor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Poll"
        }
    ],
    googleId: {type: String, required: true}
});

UserSchema.methods.hasVotedFor = function(poll_id) {
    for (userPollId of this.pollsVotedFor) {
        if (userPollId.equals(poll_id)) {
            return true;
        }
    }
    return false;
};

UserSchema.methods.addVotedFor = function(poll_id, callback) {
    this.pollsVotedFor.push(mongoose.Types.ObjectId(poll_id));
    this.save(callback);
};

module.exports = mongoose.model('User', UserSchema);
