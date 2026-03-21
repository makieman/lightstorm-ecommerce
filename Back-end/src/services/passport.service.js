const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('../Models/user.model');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const googleId = profile.id;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('Google account did not provide an email'), null);
        }

        let user = await UserModel.findOne({
          $or: [{ googleId }, { email }],
        });

        if (user) {
          if (!user.googleId) {
            user.googleId = googleId;
            user.isVerified = true;
            if (avatar) user.image = avatar;
            await user.save();
          }
          return done(null, user);
        }

        user = await UserModel.create({
          username: name,
          email,
          googleId,
          image: avatar,
          isVerified: true,
          password: crypto.randomBytes(32).toString('hex'),
        });

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;