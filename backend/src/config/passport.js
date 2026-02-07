import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const setupPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Check if email already exists (regular signup)
          const emailExists = await User.findOne({ email: profile.emails[0].value });
          
          if (emailExists) {
            // Link Google account to existing user
            emailExists.googleId = profile.id;
            await emailExists.save();
            return done(null, emailExists);
          }

          // Create new user
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            password: 'google-oauth-' + Math.random().toString(36), // Random password for Google users
            notepad: ''
          });

          await user.save();
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
