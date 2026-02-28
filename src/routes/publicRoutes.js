const express = require("express");
const User = require("../models/User");
const Event = require("../models/Event");
const Announcement = require("../models/Announcement");
const SpotlightPhoto = require("../models/SpotlightPhoto");

const router = express.Router();

router.get("/", async (req, res) => {
  const [events, announcements, spotlightPhotos, fallbackSpotlightEvents] = await Promise.all([
    Event.find().sort({ eventDate: 1 }).limit(3),
    Announcement.find().sort({ createdAt: -1 }).limit(3),
    SpotlightPhoto.find().sort({ createdAt: -1 }).limit(60),
    Event.find().sort({ eventDate: 1 }).limit(30)
  ]);
  const photoSlides = spotlightPhotos.map((photo) => ({
    title: photo.title,
    location: photo.location,
    eventDate: photo.eventDate || photo.createdAt,
    coverImage: photo.imageUrl
  }));

  const eventSlides = fallbackSpotlightEvents
    .filter((event) => event.coverImage)
    .map((event) => ({
      title: event.title,
      location: event.location,
      eventDate: event.eventDate,
      coverImage: event.coverImage
    }));

  const fallbackSlides = [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1511795409834-432f7b1b8f9f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1496337589254-7e19d01cec44?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&q=80"
  ].map((url, idx) => ({
    title: `Batch Memory ${idx + 1}`,
    location: "MGHS-19",
    eventDate: new Date(),
    coverImage: url
  }));

  const merged = [...photoSlides, ...eventSlides];
  const uniqueByImage = Array.from(
    new Map(merged.map((item) => [item.coverImage, item])).values()
  );
  const spotlightEvents =
    uniqueByImage.length >= 8
      ? uniqueByImage
      : [...uniqueByImage, ...fallbackSlides].slice(0, 20);

  res.render("public/home", { title: "Home", events, announcements, spotlightEvents });
});

router.get("/about", (req, res) => {
  res.render("public/about", { title: "About" });
});

router.get("/pictures", async (req, res) => {
  const members = await User.find({ role: "member", status: "approved" })
    .select("name profilePicture")
    .sort({ name: 1 });
  res.render("public/pictures", { title: "Pictures", members });
});

router.get("/members", async (req, res) => {
  const members = await User.find({ role: "member", status: "approved" }).sort({ name: 1 });
  res.render("public/members", { title: "Members", members });
});

router.get("/events", async (req, res) => {
  const events = await Event.find().sort({ eventDate: 1 });
  res.render("public/events", { title: "Events", events });
});

router.get("/announcements", async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.render("public/announcements", { title: "Announcements", announcements });
});

module.exports = router;
