const jwt = require("jsonwebtoken");

const COOKIE_NAME = "mghs_token";
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

function signAuthToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

module.exports = { COOKIE_NAME, signAuthToken, setAuthCookie, clearAuthCookie };
