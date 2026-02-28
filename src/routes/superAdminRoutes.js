const express = require("express");
const bcrypt = require("bcryptjs");
const { isSuperAdmin } = require("../middleware/auth");
const upload = require("../utils/upload");
const User = require("../models/User");
const Event = require("../models/Event");
const EventJoin = require("../models/EventJoin");
const Announcement = require("../models/Announcement");
const SpotlightPhoto = require("../models/SpotlightPhoto");

const router = express.Router();
router.use(isSuperAdmin);

async function getData() {
  const [admins, pendingMembers, members, events, announcements, joins, spotlightPhotos] = await Promise.all([
    User.find({ role: { $in: ["admin", "superadmin"] } }).sort({ createdAt: -1 }),
    User.find({ role: "member", status: "pending" }).sort({ createdAt: -1 }),
    User.find({ role: "member" }).sort({ createdAt: -1 }),
    Event.find().sort({ createdAt: -1 }),
    Announcement.find().sort({ createdAt: -1 }),
    EventJoin.find().sort({ createdAt: -1 }),
    SpotlightPhoto.find().sort({ createdAt: -1 })
  ]);

  const details = {
    totalUsers: admins.length + members.length,
    totalAdmins: admins.length,
    totalMembers: members.length,
    totalPendingMembers: pendingMembers.length,
    totalEvents: events.length,
    totalAnnouncements: announcements.length,
    totalEventRequests: joins.length,
    totalSpotlightPhotos: spotlightPhotos.length
  };

  return { admins, pendingMembers, members, events, announcements, details };
}

router.get("/", async (req, res) => {
  const data = await getData();
  res.render("superadmin/dashboard", { title: "Super Admin Dashboard", ...data, error: null });
});

router.post("/admins", upload.single("profilePicture"), async (req, res) => {
  try {
    const { name, email, phone, batchInfo, password, role } = req.body;
    const nextRole = role === "superadmin" ? "superadmin" : "admin";
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw new Error("Email already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      phone,
      batchInfo,
      passwordHash,
      profilePicture: req.file?.path,
      role: nextRole,
      status: "approved"
    });

    res.redirect("/superadmin");
  } catch (err) {
    const data = await getData();
    res.status(400).render("superadmin/dashboard", {
      title: "Super Admin Dashboard",
      ...data,
      error: err.message
    });
  }
});

router.post("/admins/:id/delete", async (req, res) => {
  if (req.params.id === req.authUser.id) return res.redirect("/superadmin");
  await User.findOneAndDelete({ _id: req.params.id, role: { $in: ["admin", "superadmin"] } });
  res.redirect("/superadmin");
});

router.post("/members/:id/approve", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.redirect("/superadmin");
});

router.post("/members/:id/reject", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.redirect("/superadmin");
});

router.post("/members/:id/delete", async (req, res) => {
  await User.findOneAndDelete({ _id: req.params.id, role: "member" });
  res.redirect("/superadmin");
});

router.post("/events", async (req, res) => {
  const { title, description, eventDate, location, coverImage } = req.body;
  await Event.create({ title, description, eventDate, location, coverImage, createdBy: req.authUser.id });
  res.redirect("/superadmin");
});

router.post("/events/:id/delete", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  await EventJoin.deleteMany({ event: req.params.id });
  res.redirect("/superadmin");
});

router.post("/announcements", async (req, res) => {
  const { title, message } = req.body;
  await Announcement.create({ title, message, createdBy: req.authUser.id });
  res.redirect("/superadmin");
});

router.post("/announcements/:id/delete", async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.redirect("/superadmin");
});

module.exports = router;
