const jwt = require("jsonwebtoken");
const { COOKIE_NAME } = require("../utils/jwt");
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

function attachAuthUser(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  res.locals.adminContact = process.env.ADMIN_EMAIL || "admin@mghs19.com";
  if (!token) {
    req.authUser = null;
    res.locals.currentUser = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.authUser = payload;
    res.locals.currentUser = payload;
  } catch (_) {
    req.authUser = null;
    res.locals.currentUser = null;
    res.clearCookie(COOKIE_NAME);
  }

  next();
}

function isLoggedIn(req, res, next) {
  if (!req.authUser) return res.redirect("/auth/login");
  next();
}

function isMember(req, res, next) {
  if (!req.authUser || req.authUser.role !== "member") return res.redirect("/auth/login");
  next();
}

function isAdmin(req, res, next) {
  if (!req.authUser || req.authUser.role !== "admin") return res.redirect("/auth/login");
  next();
}

function isSuperAdmin(req, res, next) {
  if (!req.authUser || req.authUser.role !== "superadmin") return res.redirect("/auth/login");
  next();
}

function isStaff(req, res, next) {
  if (!req.authUser || !["admin", "superadmin"].includes(req.authUser.role)) return res.redirect("/auth/login");
  next();
}

module.exports = { attachAuthUser, isLoggedIn, isMember, isAdmin, isSuperAdmin, isStaff };
