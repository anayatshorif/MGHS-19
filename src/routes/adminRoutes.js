const express = require("express");
const { isAdmin } = require("../middleware/auth");
const uploadEvent = require("../utils/uploadEvent");
const User = require("../models/User");
const Event = require("../models/Event");
const EventJoin = require("../models/EventJoin");
const Announcement = require("../models/Announcement");
const SpotlightPhoto = require("../models/SpotlightPhoto");
const Notification = require("../models/Notification");

const router = express.Router();
router.use(isAdmin);

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getAdminData() {
  const [pendingMembers, members, events, joins, announcements, spotlightPhotos] = await Promise.all([
    User.find({ role: "member", status: "pending" }).sort({ createdAt: -1 }),
    User.find({ role: "member" }).sort({ createdAt: -1 }),
    Event.find().sort({ createdAt: -1 }),
    EventJoin.find()
      .populate("member", "name nickName phone profilePicture")
      .populate("event", "title")
      .sort({ createdAt: -1 }),
    Announcement.find().sort({ createdAt: -1 }),
    SpotlightPhoto.find().sort({ createdAt: -1 }).limit(20)
  ]);

  const details = {
    totalMembers: members.length,
    totalPendingMembers: pendingMembers.length,
    totalEvents: events.length,
    totalAnnouncements: announcements.length,
    totalEventRequests: joins.length,
    totalSpotlightPhotos: spotlightPhotos.length
  };

  return { pendingMembers, members, events, joins, announcements, spotlightPhotos, details };
}

router.get("/", async (req, res) => {
  const data = await getAdminData();
  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    ...data,
    error: null
  });
});

router.get("/members/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  const query = { role: "member" };

  if (q) {
    const terms = q
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => new RegExp(escapeRegex(term), "i"));

    query.$and = terms.map((regex) => ({
      $or: [{ name: regex }, { nickName: regex }, { email: regex }]
    }));
  }

  const members = await User.find(query)
    .select("_id name nickName email")
    .sort({ name: 1 })
    .limit(300);

  return res.json({ members });
});

router.post("/members/:id/approve", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.redirect("/admin");
});

router.post("/members/:id/reject", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.redirect("/admin");
});

router.post("/members/:id/delete", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

router.post("/events", async (req, res) => {
  const { title, description, eventDate, location, coverImage } = req.body;
  await Event.create({ title, description, eventDate, location, coverImage, createdBy: req.authUser.id });
  res.redirect("/admin");
});

router.post("/events/:id/update", async (req, res) => {
  const { title, description, eventDate, location, coverImage } = req.body;
  await Event.findByIdAndUpdate(req.params.id, { title, description, eventDate, location, coverImage });
  res.redirect("/admin");
});

router.post("/events/:id/delete", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  await EventJoin.deleteMany({ event: req.params.id });
  res.redirect("/admin");
});

router.post("/events/join/:id/approve", async (req, res) => {
  await EventJoin.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.redirect("/admin");
});

router.post("/events/join/:id/reject", async (req, res) => {
  await EventJoin.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.redirect("/admin");
});

router.post("/events/join/:id/payment-paid", async (req, res) => {
  const join = await EventJoin.findById(req.params.id).populate("member", "_id").populate("event", "title");
  if (!join) return res.redirect("/admin#admin-requests");

  const wasPaid = (join.paymentStatus || "unpaid") === "paid";
  join.paymentStatus = "paid";
  await join.save();

  if (!wasPaid) {
    await Notification.create({
      member: join.member._id,
      type: "payment",
      message: `Your payment has been confirmed for "${join.event?.title || "event"}".`
    });
  }

  res.redirect("/admin#admin-requests");
});

router.post("/events/join/:id/payment-unpaid", async (req, res) => {
  await EventJoin.findByIdAndUpdate(req.params.id, { paymentStatus: "unpaid" });
  res.redirect("/admin#admin-requests");
});

router.post("/announcements", async (req, res) => {
  const { title, message } = req.body;
  await Announcement.create({ title, message, createdBy: req.authUser.id });
  res.redirect("/admin");
});

router.post("/announcements/:id/update", async (req, res) => {
  const { title, message } = req.body;
  await Announcement.findByIdAndUpdate(req.params.id, { title, message });
  res.redirect("/admin");
});

router.post("/announcements/:id/delete", async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

router.post("/spotlight-photos", uploadEvent.array("photos", 8), async (req, res) => {
  try {
    const { title, location, eventDate } = req.body;
    const files = req.files || [];
    if (!files.length) throw new Error("Please upload at least one event photo");

    const baseTitle = (title || "Batch Event Moments").trim();
    const docs = files.map((file, idx) => ({
      title: files.length > 1 ? `${baseTitle} #${idx + 1}` : baseTitle,
      location: (location || "MGHS Campus").trim(),
      eventDate: eventDate || undefined,
      imageUrl: file.path,
      uploadedBy: req.authUser.id
    }));

    await SpotlightPhoto.insertMany(docs);
    res.redirect("/admin");
  } catch (err) {
    const data = await getAdminData();
    res.status(400).render("admin/dashboard", {
      title: "Admin Dashboard",
      ...data,
      error: err.message
    });
  }
});

router.post("/spotlight-photos/:id/update", async (req, res) => {
  const { title, location, eventDate } = req.body;
  await SpotlightPhoto.findByIdAndUpdate(req.params.id, { title, location, eventDate });
  res.redirect("/admin");
});

router.post("/spotlight-photos/:id/delete", async (req, res) => {
  await SpotlightPhoto.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

module.exports = router;
