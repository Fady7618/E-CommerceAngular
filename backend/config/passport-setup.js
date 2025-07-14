const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');

// Get callback URL based on environment
const callbackUrl = process.env.NODE_ENV === 'production'
  ? process.env.GOOGLE_CALLBACK_URL_PRODUCTION
  : process.env.GOOGLE_CALLBACK_URL;

module.exports = () => {
  // JWT Strategy for protected routes
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.id);
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackUrl,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google profile:', profile);
          
          // Extract profile information
          const googleId = profile.id;
          const email = profile.emails[0].value;
          const firstName = profile.name.givenName;
          const lastName = profile.name.familyName;
          const profileImage = profile.photos[0].value;

          // Check if user already exists with this Google ID
          let user = await User.findOne({ google_id: googleId });
          
          if (user) {
            return done(null, user);
          }

          // Check if user exists with the email
          user = await User.findOne({ email });
          
          if (user) {
            // Link existing account with Google
            user.google_id = googleId;
            user.provider = 'google';
            if (!user.profile_image && profileImage) {
              user.profile_image = profileImage;
            }
            await user.save();
            return done(null, user);
          }

          // Create a new user
          user = await User.create({
            google_id: googleId,
            email,
            first_name: firstName,
            last_name: lastName,
            profile_image: profileImage,
            provider: 'google'
          });

          return done(null, user);
        } catch (error) {
          console.error('Error in Google strategy:', error);
          return done(error, false);
        }
      }
    )
  );

  // Serialize and deserialize user
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