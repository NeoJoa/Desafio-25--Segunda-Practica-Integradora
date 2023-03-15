import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import passport from "passport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "\\public\\images");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const passportCallback = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (error, user, info) {
      if (info) req.info = info.message || info.toString();
      console.log(
        "(console.log desde utils.js) Aca en el middleware si aparece el info del error pero en el router no \n",
        info.message || info.toString()
      );
      if (error) return next(error);
      if (!user) {
        return res
          .status(401)
          .send({ error: info.message ? info.message : info.toString() });
      }
      req.user = user;
      return next();
    })(req, res, next);
  };
};

export const uploader = multer({ storage });

export const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isCorrect = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

export default __dirname;
