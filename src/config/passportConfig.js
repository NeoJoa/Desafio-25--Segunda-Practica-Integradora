import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { createHash, isCorrect } from "../utils.js";
import githubService from "passport-github2";
import UsersManager from "../dao/dbManager/UsersManager.js";

const usersManager = new UsersManager();

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["coderCookieToken"];
  }
  return token;
};

const initPassport = () => {
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: "secretCode",
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload, {
            message: "Mensaje de prueba para probar los errores personalizados",
          });
        } catch (error) {
          return done(error, false, { message: "Mensaje de ERROR de prueba" });
        }
      }
    )
  );

  passport.use(
    "github",
    new githubService(
      {
        clientID: "Iv1.f404a03d79d38515",
        clientSecret: "266d2064da8d10c6ffccb3e18543d80618d3f255",
        callbackURL: "http://localhost:8080/api/session/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await usersManager.getUserBy({
            email: profile._json.email,
          });
          if (!user) {
            const newUser = {
              firstName: profile._json.name,
              lastName: "",
              email: profile._json.email,
              password: "",
            };
            const result = await usersManager.addUser(newUser);
            return done(null, result);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, email, password, done) => {
        const { firstName, lastName, age } = req.body;
        try {
          const exist = await usersManager.getUserBy({ email });
          if (exist) {
            return done(null, false, { message: "The user already exist" });
          }
          const newUser = {
            firstName,
            lastName,
            age,
            cartId: undefined,
            email,
            password: createHash(password),
          };
          const result = await usersManager.addUser(newUser);
          return done(null, result, { message: "User created successfully" });
        } catch (error) {
          return done("Error getting user" + error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", session: false },
      async (email, password, done) => {
        try {
          const user = await usersManager.getUserBy({ email });
          if (!user) {
            return done(null, false, { message: "Email not registered" });
          }
          if (!isCorrect(user, password))
            return done(null, false, { message: "Incorrect password" });
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await usersManager.getUserBy({ _id: id });
    done(null, user);
  });
};

export default initPassport;
