import { Router } from "express";
import passport from "passport";
import userModel from "../dao/models/users.model.js";
import jwt from "jsonwebtoken";
import { passportCallback } from "../utils.js";

const router = Router();

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    res.redirect("/");
  }
);

router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "failRegister",
    passReqToCallback: true,
    session: false,
  }),
  (req, res) => {
    return res.send({
      status: "success",
      message: "User registered",
      payload: req.user._id,
    });
  }
);

router.get("/failRegister", (req, res) => {
  res.send({ error: "Fail register" });
});

router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "failLogin",
    session: false,
  }),
  async (req, res) => {
    const serializeUser = {
      id: req.user._id,
      name: `${req.user.firstName} ${req.user.lastName}`,
      role: req.user.role,
      email: req.user.email,
    };
    const token = jwt.sign(serializeUser, "secretCode", { expiresIn: "1h" });
    res.cookie("coderCookieToken", token, {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
    });
    res.send({
      status: "success",
      message: "Login success",
      payload: serializeUser,
    });
  }
);

router.get("/failLogin", async (req, res) => {
  res.send({ error: "Fail login" });
});

router.post("/logout", async (req, res) => {
  res.clearCookie("coderCookieToken").send({ message: "Logout success" });
});

router.post("/recover", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send({ status: 404, error: "Incomplete values" });
  await userModel.findOneAndUpdate(
    { email: email },
    { password: createHash(password) }
  );
  res.send({ status: "success", message: "Password updated" });
});

router.get("/current", passportCallback("jwt"), (req, res) => {
  console.log(
    "(console.log desde el session.router) Este console.log solo aparece si estas login y entraste al session/current",
    req.info
  );
  res.send(req.user);
});

export default router;
