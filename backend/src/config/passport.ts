import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import User from '../models/User';
import dotenv from 'dotenv';
dotenv.config();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error('Google account does not provide an email address.'), undefined);
        }
        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              email,
              username: profile.displayName || email.split('@')[0],
              phone: '',
              dateOfBirth: new Date(0), // Placeholder, as Google profile doesn't provide DOB
              password: '', // Not used for Google users
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport; 