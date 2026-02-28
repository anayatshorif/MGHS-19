require("dotenv").config();
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const { attachAuthUser } = require("./src/middleware/auth");

const authRoutes = require("./src/routes/authRoutes");
const publicRoutes = require("./src/routes/publicRoutes");
const memberRoutes = require("./src/routes/memberRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const superAdminRoutes = require("./src/routes/superAdminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(attachAuthUser);

app.use("/", publicRoutes);
app.use("/auth", authRoutes);
app.use("/member", memberRoutes);
app.use("/admin", adminRoutes);
app.use("/superadmin", superAdminRoutes);

app.use((req, res) => {
  res.status(404).render("public/404", { title: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
