import dotenv from "dotenv";
dotenv.config();

import User from "../models/userModel.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export const initializingPassport = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:9889/auth/google/callback",
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });

          if (user) {
            done(null, user);
          } else {
            const newUser = new User({
              name: profile.displayName,
              email: email,
              mobile: profile.phoneNumber ? profile.phoneNumber[0] : null,
              isAdmin: false,
              googleId :profile.id
            });
            await newUser.save();
            done(null, newUser);
          }
        } catch (error) {
          console.log(error.message);
          done(error, null);  
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};                   
