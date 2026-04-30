const express = require("express");
const cors = require("cors");
const path = require("path");
const { put, list } = require("@vercel/blob");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ ชี้โฟลเดอร์สำหรับไฟล์ Static (HTML, CSS, JS หน้าบ้าน)
app.use(express.static(path.join(__dirname, "../web")));

// ==========================================
// 🗄️ โครงสร้างฐานข้อมูลเริ่มต้น
// ==========================================
let db = {
  users: [{ username: "admin", password: "1234", status: "active" }],
  bookings: [],
  services: [
    { id: "1", name: "ยื่นเรื่องร้องเรียน", duration: 30, maxQueue: 20 },
    { id: "2", name: "ปรึกษาเจ้าหน้าที่", duration: 60, maxQueue: 10 },
    { id: "3", name: "ติดตามสถานะ", duration: 15, maxQueue: 40 },
  ],
  staff: [
    {
      id: "1",
      name: "สมชาย",
      role: "ผู้เชี่ยวชาญด้านเอกสาร",
      image: "img/staff-1.png",
    },
    {
      id: "2",
      name: "สมหญิง",
      role: "ให้คำปรึกษาทั่วไป",
      image: "img/staff-2.png",
    },
    {
      id: "3",
      name: "มานะ",
      role: "รับเรื่องร้องเรียน",
      image: "img/staff-3.png",
    },
    {
      id: "4",
      name: "ไม่ระบุ",
      role: "เจ้าหน้าที่ท่านใดก็ได้",
      image: "img/staff-4.png",
    },
  ],
  settings: {
    workingDays: [1, 2, 3, 4, 5],
    holidays: [],
    openTime: "09:00",
    closeTime: "16:00",
  },
};

// ==========================================
// ☁️ ระบบซิงค์ข้อมูลกับ Vercel Blob (Persistence)
// ==========================================
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN="vercel_blob_rw_jkxAFcUjSSLt2lAS_VS8ff25SuJvJyiZxjC46ZxerbSo6IW";

async function syncFromBlob() {
  if (!BLOB_TOKEN) return;
  try {
    const { blobs } = await list({ token: BLOB_TOKEN });
    const dbFile = blobs.find((b) => b.pathname === "database.json");
    if (dbFile) {
      const res = await fetch(dbFile.url);
      const data = await res.json();
      if (data && data.users) {
        db = data;
        console.log("✅ Database Loaded from Blob");
      }
    } else {
      await syncToBlob();
    }
  } catch (e) {
    console.error("❌ Blob Sync Load Error:", e);
  }
}

async function syncToBlob() {
  if (!BLOB_TOKEN) return;
  try {
    await put("database.json", JSON.stringify(db), {
      access: "public",
      addRandomSuffix: false,
      token: BLOB_TOKEN,
    });
    console.log("☁️ Database Saved to Blob");
  } catch (e) {
    console.error("❌ Blob Sync Save Error:", e);
  }
}

// 🛡️ Middleware: โหลดข้อมูลจาก Blob ก่อนประมวลผล (สำหรับ Serverless)
let isDbLoaded = false;
app.use(async (req, res, next) => {
  if (!isDbLoaded && req.path.startsWith("/api")) {
    await syncFromBlob();
    isDbLoaded = true;
  }
  next();
});

// ==========================================
// 🚀 API Endpoints
// ==========================================

// --- ⚙️ ระบบตั้งค่า ---
app.get("/api/settings", (req, res) => res.json(db.settings));
app.put("/api/settings", async (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  await syncToBlob();
  res.json({ success: true, message: "บันทึกสำเร็จ" });
});

// --- 👤 สมาชิก & ล็อกอิน ---
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (db.users.find((u) => u.username === username)) {
    return res
      .status(400)
      .json({ success: false, message: "ชื่อผู้ใช้นี้มีในระบบแล้ว" });
  }
  db.users.push({ username, password, status: "active" });
  await syncToBlob();
  res.status(201).json({ success: true, message: "สมัครสมาชิกสำเร็จ" });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(
    (u) => u.username === username && u.password === password,
  );
  if (user) {
    if (user.status === "blocked" && username !== "admin") {
      return res.status(403).json({ success: false, message: "บัญชีถูกระงับ" });
    }
    res.json({ success: true, message: "เข้าสู่ระบบสำเร็จ" });
  } else {
    res
      .status(401)
      .json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
  }
});

// --- 🛠️ จัดการบริการ & เจ้าหน้าที่ ---
app.get("/api/services", (req, res) => res.json(db.services));
app.post("/api/services", async (req, res) => {
  db.services.push({ id: Date.now().toString(), ...req.body });
  await syncToBlob();
  res.status(201).json({ success: true });
});
app.put("/api/services/:id", async (req, res) => {
  const idx = db.services.findIndex((s) => s.id === req.params.id);
  if (idx !== -1) {
    db.services[idx] = { ...db.services[idx], ...req.body };
    await syncToBlob();
    res.json({ success: true });
  }
});
app.delete("/api/services/:id", async (req, res) => {
  db.services = db.services.filter((s) => s.id !== req.params.id);
  await syncToBlob();
  res.json({ success: true });
});
app.get("/api/staff", (req, res) => res.json(db.staff));

// --- 📅 ค้นหาคิวว่าง & สถานะปฏิทิน ---
function generateSlots(duration, max) {
  let slots = [];
  let [oh, om] = db.settings.openTime.split(":").map(Number);
  let [ch, cm] = db.settings.closeTime.split(":").map(Number);
  let cur = oh * 60 + om,
    end = ch * 60 + cm;
  while (cur + parseInt(duration) <= end && slots.length < max) {
    slots.push(
      `${Math.floor(cur / 60)
        .toString()
        .padStart(2, "0")}:${(cur % 60).toString().padStart(2, "0")}`,
    );
    cur += parseInt(duration);
  }
  return slots;
}

app.get("/api/timeslots", (req, res) => {
  const { date, service } = req.query;
  const s = db.services.find((x) => x.name === service);
  if (!s) return res.json({ slots: [] });
  const slots = generateSlots(s.duration, s.maxQueue).map((time) => ({
    time,
    status: db.bookings.some(
      (b) =>
        b.bookingDate === date && b.serviceType === service && b.time === time,
    )
      ? "full"
      : "available",
  }));
  res.json({ slots });
});

app.get("/api/month-status", (req, res) => {
  const { month, service } = req.query;
  const s = db.services.find((x) => x.name === service);
  if (!s)
    return res.json({ counts: {}, maxSlotsPerDay: 0, settings: db.settings });
  const counts = {};
  db.bookings.forEach((b) => {
    if (b.bookingDate.startsWith(month) && b.serviceType === service)
      counts[b.bookingDate] = (counts[b.bookingDate] || 0) + 1;
  });
  res.json({ counts, maxSlotsPerDay: s.maxQueue, settings: db.settings });
});

// --- 🎫 การจองคิว & ตรวจสอบสถานะ ---
app.post("/api/book", async (req, res) => {
  const b = req.body;
  const user = db.users.find((u) => u.username === b.username);
  if (user?.status === "blocked")
    return res.status(403).json({ success: false, message: "บัญชีถูกระงับ" });

  b.id = Date.now().toString();
  b.queueNumber = "Q-" + Math.floor(1000 + Math.random() * 9000);
  db.bookings.push(b);
  await syncToBlob();
  res
    .status(201)
    .json({ success: true, message: "จองสำเร็จ", bookingId: b.id });
});

app.get("/api/bookings/:id", (req, res) => {
  const b = db.bookings.find((x) => x.id === req.params.id);
  res.json(b ? { success: true, data: b } : { success: false });
});

app.delete("/api/bookings/:id", async (req, res) => {
  db.bookings = db.bookings.filter((x) => x.id !== req.params.id);
  await syncToBlob();
  res.json({ success: true });
});

app.get("/api/my-bookings", (req, res) => {
  res.json(db.bookings.filter((x) => x.username === req.query.username));
});

app.post("/api/check-queue", (req, res) => {
  const qNum = req.body.queueNumber.toUpperCase();
  const myB = db.bookings.find((x) => x.queueNumber.toUpperCase() === qNum);
  if (!myB)
    return res.status(404).json({ success: false, message: "ไม่พบคิว" });

  const todayB = db.bookings
    .filter((x) => x.bookingDate === myB.bookingDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  const idx = todayB.findIndex((x) => x.queueNumber === myB.queueNumber);
  const dur =
    db.services.find((s) => s.name === myB.serviceType)?.duration || 15;

  res.json({
    success: true,
    data: {
      myQueue: myB.queueNumber,
      currentQueue:
        todayB.find((x) => x.status === "กำลังให้บริการ")?.queueNumber ||
        todayB[0].queueNumber,
      peopleAhead: idx,
      estimatedWaitTime: idx * dur,
      service: myB.serviceType,
      time: myB.time,
      date: myB.bookingDate,
    },
  });
});

// --- 👑 Admin Functions ---
app.get("/api/admin/stats", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const tb = db.bookings.filter((x) => x.bookingDate === today);
  const peak = {};
  generateSlots(60, 10).forEach(
    (t) =>
      (peak[t] = db.bookings.filter((b) =>
        b.time.startsWith(t.split(":")[0]),
      ).length),
  );

  res.json({
    todayTotal: tb.length,
    allTotal: db.bookings.length,
    waiting: tb.filter((x) => x.status === "รอดำเนินการ").length,
    completed: tb.filter((x) => x.status === "เสร็จสิ้น").length,
    peakTimes: peak,
  });
});

app.get("/api/admin/today-queues", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  res.json(
    db.bookings
      .filter((x) => x.bookingDate === today)
      .sort((a, b) => a.time.localeCompare(b.time)),
  );
});

app.put("/api/admin/queues/:id/status", async (req, res) => {
  const b = db.bookings.find((x) => x.id === req.params.id);
  if (b) {
    b.status = req.body.status;
    await syncToBlob();
    res.json({ success: true });
  }
});

app.post("/api/admin/next-queue", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const next = db.bookings
    .filter((x) => x.bookingDate === today && x.status === "รอดำเนินการ")
    .sort((a, b) => a.time.localeCompare(b.time))[0];
  if (!next)
    return res.status(404).json({ success: false, message: "ไม่มีคิวรอ" });

  db.bookings
    .filter((x) => x.bookingDate === today && x.status === "กำลังให้บริการ")
    .forEach((x) => (x.status = "เสร็จสิ้น"));
  next.status = "กำลังให้บริการ";
  await syncToBlob();
  res.json({ success: true, queueNumber: next.queueNumber });
});

app.post("/api/admin/urgent-booking", async (req, res) => {
  const u = {
    ...req.body,
    id: Date.now().toString(),
    queueNumber: "URG-" + Math.floor(100 + Math.random() * 899),
    status: "กำลังให้บริการ",
  };
  db.bookings.push(u);
  await syncToBlob();
  res.status(201).json({ success: true });
});

// --- 👤 User Management ---
app.get("/api/admin/users-list", (req, res) => {
  res.json(
    db.users
      .filter((u) => u.username !== "admin")
      .map((u) => ({
        username: u.username,
        status: u.status,
        bookingCount: db.bookings.filter((b) => b.username === u.username)
          .length,
        history: db.bookings.filter((b) => b.username === u.username),
      })),
  );
});

app.put("/api/admin/users/:user/toggle-block", async (req, res) => {
  const u = db.users.find((x) => x.username === req.params.user);
  if (u) {
    u.status = u.status === "blocked" ? "active" : "blocked";
    await syncToBlob();
    res.json({ success: true });
  }
});

app.put("/api/admin/users/:user/password", async (req, res) => {
  const u = db.users.find((x) => x.username === req.params.user);
  if (u) {
    u.password = req.body.newPassword;
    await syncToBlob();
    res.json({ success: true });
  }
});

app.delete("/api/admin/users/:user", async (req, res) => {
  db.users = db.users.filter((x) => x.username !== req.params.user);
  db.bookings = db.bookings.filter((x) => x.username !== req.params.user);
  await syncToBlob();
  res.json({ success: true });
});

// ✅ Export เพื่อให้ Vercel ใช้งานได้
module.exports = app;

// สำหรับรัน Test ในเครื่อง Local
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`🚀 Local Server running at http://localhost:${PORT}`),
  );
}
