const express = require("express");
const { isMember } = require("../middleware/auth");
const upload = require("../utils/upload");
const User = require("../models/User");
const Event = require("../models/Event");
const EventJoin = require("../models/EventJoin");
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const { signAuthToken, setAuthCookie } = require("../utils/jwt");

const router = express.Router();
router.use(isMember);

router.get("/", async (req, res) => {
  const userId = req.authUser.id;
  const [member, members, events, announcements, joins, notifications] = await Promise.all([
    User.findById(userId),
    User.find({ role: "member", status: "approved" }).sort({ name: 1 }),
    Event.find().sort({ eventDate: 1 }),
    Announcement.find().sort({ createdAt: -1 }),
    EventJoin.find({ member: userId }),
    Notification.find({ member: userId }).sort({ createdAt: -1 }).limit(10)
  ]);

  const joinMap = new Map(joins.map(j => [j.event.toString(), j.status]));
  res.render("member/dashboard", { title: "Member Dashboard", member, members, events, announcements, joinMap, notifications });
});

router.get("/profile", async (req, res) => {
  const member = await User.findById(req.authUser.id);
  res.render("member/profile", { title: "My Profile", member });
});

router.get("/profile/edit", async (req, res) => {
  const member = await User.findById(req.authUser.id);
  res.render("member/edit-profile", { title: "Update Profile", member, error: null });
});

router.get("/members/:id", async (req, res) => {
  const selectedMember = await User.findOne({
    _id: req.params.id,
    role: "member",
    status: "approved"
  });

  if (!selectedMember) {
    return res.status(404).render("public/404", { title: "Not Found" });
  }

  return res.render("member/member-details", {
    title: `${selectedMember.name} - Profile`,
    selectedMember
  });
});

router.post("/profile/edit", upload.single("profilePicture"), async (req, res) => {
  try {
    const {
      name,
      nickName,
      phone,
      shift,
      college,
      university,
      permanentAddress,
      currentAddress,
      profession,
      batchInfo
    } = req.body;
    const update = { name, nickName, phone, shift, college, university, permanentAddress, currentAddress, profession, batchInfo };
    if (req.file?.path) update.profilePicture = req.file.path;

    const member = await User.findByIdAndUpdate(req.authUser.id, update, { new: true });
    const token = signAuthToken(member);
    setAuthCookie(res, token);
    res.redirect("/member/profile");
  } catch (error) {
    const member = await User.findById(req.authUser.id);
    res.render("member/edit-profile", { title: "Update Profile", member, error: error.message });
  }
});

router.post("/events/:id/join", async (req, res) => {
  try {
    await EventJoin.create({ event: req.params.id, member: req.authUser.id });
  } catch (_) {}
  res.redirect("/member");
});

router.get("/events/register", async (req, res) => {
  const userId = req.authUser.id;
  const [events, joins] = await Promise.all([
    Event.find().sort({ eventDate: 1 }),
    EventJoin.find({ member: userId })
  ]);
  const joinMap = new Map(joins.map((j) => [j.event.toString(), j.status]));
  res.render("member/event-register", {
    title: "Event Registration",
    events,
    joinMap,
    selectedEventId: req.query.eventId || "",
    error: null,
    success: req.query.success || null
  });
});

router.post("/events/register", async (req, res) => {
  try {
    const { eventId } = req.body;
    const exists = await Event.findById(eventId);
    if (!exists) throw new Error("Selected event does not exist");

    await EventJoin.create({ event: eventId, member: req.authUser.id });
    return res.redirect("/member/events/register?success=Your request has been submitted");
  } catch (error) {
    const userId = req.authUser.id;
    const [events, joins] = await Promise.all([
      Event.find().sort({ eventDate: 1 }),
      EventJoin.find({ member: userId })
    ]);
    const joinMap = new Map(joins.map((j) => [j.event.toString(), j.status]));
    return res.status(400).render("member/event-register", {
      title: "Event Registration",
      events,
      joinMap,
      selectedEventId: req.body.eventId || "",
      error: error.code === 11000 ? "You already requested this event" : error.message,
      success: null
    });
  }
});

module.exports = router;
