const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            User.find({googleId: profile.id}, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (user === null) {
                    // Create user
                    User.create({googleId: profile.id}, (err, user) => {
                        if (err) {
                            return done(err);
                        }
                        if (user === null) {
                            return done(err, false, 'There was an error creating the user.');
                        }
                        return done(err, user);
                    })
                }
                // User exists
                return done(err, user);
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};
