require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Event = require("../models/Event");
const EventJoin = require("../models/EventJoin");
const Announcement = require("../models/Announcement");
const DEFAULT_PROFILE_ICON = "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";

async function upsertMember({ name, email, phone, batchInfo, status }) {
  const passwordHash = await bcrypt.hash("member123", 10);
  return User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        phone,
        batchInfo,
        role: "member",
        status,
        passwordHash,
        profilePicture: DEFAULT_PROFILE_ICON
      }
    },
    { upsert: true, new: true }
  );
}

(async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@mghs19.com";
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin12345", 10);
      admin = await User.create({
        name: "MGHS Super Admin",
        email: adminEmail,
        phone: "01700000000",
        batchInfo: "MGHS-19",
        role: "admin",
        status: "approved",
        passwordHash: adminHash,
        profilePicture: DEFAULT_PROFILE_ICON
      });
    }

    const members = await Promise.all([
      upsertMember({ name: "Rahim Ahmed", email: "rahim19@example.com", phone: "01711111111", batchInfo: "MGHS-19", status: "approved" }),
      upsertMember({ name: "Karim Hossain", email: "karim19@example.com", phone: "01722222222", batchInfo: "MGHS-19", status: "approved" }),
      upsertMember({ name: "Nabila Islam", email: "nabila19@example.com", phone: "01733333333", batchInfo: "MGHS-19", status: "approved" }),
      upsertMember({ name: "Sadia Akter", email: "sadia19@example.com", phone: "01744444444", batchInfo: "MGHS-19", status: "pending" })
    ]);

    const event1 = await Event.findOneAndUpdate(
      { title: "MGHS-19 Reunion Night" },
      {
        $set: {
          title: "MGHS-19 Reunion Night",
          description: "Annual reunion with dinner, memories, and cultural programs.",
          eventDate: new Date("2026-04-12"),
          location: "MGHS Main Auditorium",
          createdBy: admin._id
        }
      },
      { upsert: true, new: true }
    );

    const event2 = await Event.findOneAndUpdate(
      { title: "Friendly Cricket Match" },
      {
        $set: {
          title: "Friendly Cricket Match",
          description: "Batch members cricket match and prize giving.",
          eventDate: new Date("2026-05-02"),
          location: "City School Ground",
          createdBy: admin._id
        }
      },
      { upsert: true, new: true }
    );

    await EventJoin.findOneAndUpdate(
      { event: event1._id, member: members[0]._id },
      { $set: { status: "approved" } },
      { upsert: true }
    );

    await EventJoin.findOneAndUpdate(
      { event: event1._id, member: members[1]._id },
      { $set: { status: "pending" } },
      { upsert: true }
    );

    await EventJoin.findOneAndUpdate(
      { event: event2._id, member: members[2]._id },
      { $set: { status: "pending" } },
      { upsert: true }
    );

    await Announcement.findOneAndUpdate(
      { title: "Welcome to the Official MGHS-19 Website" },
      {
        $set: {
          title: "Welcome to the Official MGHS-19 Website",
          message: "All batch members can now sign up, update profile, and join events.",
          createdBy: admin._id
        }
      },
      { upsert: true }
    );

    await Announcement.findOneAndUpdate(
      { title: "Reunion Registration Open" },
      {
        $set: {
          title: "Reunion Registration Open",
          message: "Please join the reunion event from your dashboard. Admin approval required.",
          createdBy: admin._id
        }
      },
      { upsert: true }
    );

    const counts = {
      users: await User.countDocuments(),
      events: await Event.countDocuments(),
      joins: await EventJoin.countDocuments(),
      announcements: await Announcement.countDocuments()
    };

    console.log("Sample data seeded.");
    console.log(counts);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
})();
