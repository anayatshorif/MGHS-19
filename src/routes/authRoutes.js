const express = require("express");
const bcrypt = require("bcryptjs");
const upload = require("../utils/upload");
const User = require("../models/User");
const { signAuthToken, setAuthCookie, clearAuthCookie } = require("../utils/jwt");

const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("auth/signup", { title: "Signup", error: null });
});

router.post("/signup", upload.single("profilePicture"), async (req, res) => {
  try {
    const {
      fullName,
      nickName,
      email,
      phone,
      shift,
      college,
      university,
      permanentAddress,
      currentAddress,
      profession,
      batchInfo,
      password
    } = req.body;
    const name = fullName;
    if (!name || !nickName || !email || !phone || !shift || !college || !university || !permanentAddress || !currentAddress || !profession || !batchInfo || !password) {
      return res.render("auth/signup", { title: "Signup", error: "Please fill in all required fields" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.render("auth/signup", { title: "Signup", error: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const profilePicture = req.file?.path;

    await User.create({
      name,
      nickName,
      email,
      phone,
      shift,
      college,
      university,
      permanentAddress,
      currentAddress,
      profession,
      batchInfo,
      passwordHash,
      profilePicture
    });
    return res.redirect("/auth/login?msg=pending");
  } catch (error) {
    return res.render("auth/signup", { title: "Signup", error: error.message });
  }
});

router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login", error: null, msg: req.query.msg || null });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.render("auth/login", { title: "Login", error: "Invalid credentials", msg: null });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.render("auth/login", { title: "Login", error: "Invalid credentials", msg: null });

  if (user.role === "member" && user.status !== "approved") {
    return res.render("auth/login", { title: "Login", error: "Your account is not approved yet", msg: null });
  }

  const token = signAuthToken(user);
  setAuthCookie(res, token);

  if (user.role === "superadmin") return res.redirect("/superadmin");
  if (user.role === "admin") return res.redirect("/admin");
  return res.redirect("/member");
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.redirect("/");
});

module.exports = router;
