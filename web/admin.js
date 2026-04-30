// ✅ เปลี่ยนจาก localhost เป็น /api เพื่อรองรับ Vercel
const API = "/api";
let myChart = null;
let currentHolidays = [];

document.addEventListener("DOMContentLoaded", () => {
  loadAll();
  // ดึงข้อมูลใหม่ทุก 10 วินาทีเพื่อให้เป็น Live Dashboard
  setInterval(loadAll, 10000);
});

async function loadAll() {
  try {
    // 1. Stats & Chart
    const rs = await fetch(`${API}/admin/stats`);
    const st = await rs.json();

    document.getElementById("stTot").textContent =
      `${st.todayTotal} / ${st.allTotal}`;
    document.getElementById("stW").textContent = st.waiting;
    document.getElementById("stC").textContent = st.completed;

    // จัดการกราฟ Peak Times
    const ctx = document.getElementById("pkChart").getContext("2d");
    if (myChart) {
      myChart.destroy();
    }

    myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(st.peakTimes).map((t) => t + " น."),
        datasets: [
          {
            label: "จำนวนจอง",
            data: Object.values(st.peakTimes),
            backgroundColor: "rgba(255,102,163,0.5)",
            borderColor: "#ff66a3",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });

    // 2. Live Queues (ตารางรายการคิววันนี้)
    const rq = await fetch(`${API}/admin/today-queues`);
    const qs = await rq.json();
    document.getElementById("qTb").innerHTML = qs
      .map((q) => {
        if (q.status === "กำลังให้บริการ") {
          document.getElementById("curQ").textContent = q.queueNumber;
        }
        return `
          <tr>
            <td>${q.time}</td>
            <td><b>${q.queueNumber}</b></td>
            <td>${q.serviceType}</td>
            <td>${q.fullName}</td>
            <td>
              <select class="status-select" onchange="updS('${q.id}', this.value)">
                <option value="รอดำเนินการ" ${q.status === "รอดำเนินการ" ? "selected" : ""}>รอ</option>
                <option value="กำลังให้บริการ" ${q.status === "กำลังให้บริการ" ? "selected" : ""}>กำลังเรียก</option>
                <option value="เสร็จสิ้น" ${q.status === "เสร็จสิ้น" ? "selected" : ""}>เสร็จ</option>
              </select>
            </td>
            <td>
              <button onclick="delQ('${q.id}')" class="action-btn btn-cancel"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>`;
      })
      .join("");

    // 3. Services (ตารางจัดการบริการ)
    const rv = await fetch(`${API}/services`);
    const srvs = await rv.json();
    document.getElementById("sTb").innerHTML = srvs
      .map(
        (s) =>
          `<tr>
          <td>${s.name}</td>
          <td>${s.duration} นาที</td>
          <td>${s.maxQueue}</td>
          <td>
            <button onclick="editS('${s.id}','${s.name}',${s.duration},${s.maxQueue})" class="action-btn btn-edit"><i class="fa-solid fa-pen"></i></button> 
            <button onclick="delS('${s.id}')" class="action-btn btn-cancel"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`,
      )
      .join("");

    // 4. Settings (โหลดครั้งแรกครั้งเดียวถ้ายังไม่มีค่า)
    if (!document.getElementById("setOp").value) {
      loadSettings();
    }
  } catch (error) {
    console.error("Dashboard Load Error:", error);
  }
}

// --- ระบบการตั้งค่า ---

async function loadSettings() {
  try {
    const res = await fetch(`${API}/settings`);
    const s = await res.json();
    document.querySelectorAll('input[name="wDay"]').forEach((cb) => {
      cb.checked = s.workingDays.includes(parseInt(cb.value));
    });
    document.getElementById("setOp").value = s.openTime;
    document.getElementById("setCl").value = s.closeTime;
    currentHolidays = s.holidays || [];
    renderHolidays();
  } catch (e) {
    console.error("Load Settings Error:", e);
  }
}

function renderHolidays() {
  const box = document.getElementById("holidaysList");
  box.innerHTML = currentHolidays
    .map(
      (h, i) =>
        `<span class="holiday-pill"><i class="fa-regular fa-calendar"></i> ${h} <i class="fa-solid fa-circle-xmark" onclick="removeHoliday(${i})"></i></span>`,
    )
    .join("");
}

function addHoliday() {
  const v = document.getElementById("holidayInp").value;
  if (v && !currentHolidays.includes(v)) {
    currentHolidays.push(v);
    renderHolidays();
    document.getElementById("holidayInp").value = "";
  }
}

function removeHoliday(i) {
  currentHolidays.splice(i, 1);
  renderHolidays();
}

document.getElementById("settingsForm").onsubmit = async (e) => {
  e.preventDefault();
  const workingDays = Array.from(
    document.querySelectorAll('input[name="wDay"]:checked'),
  ).map((cb) => parseInt(cb.value));

  const b = {
    workingDays,
    openTime: document.getElementById("setOp").value,
    closeTime: document.getElementById("setCl").value,
    holidays: currentHolidays,
  };

  try {
    await fetch(`${API}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    alert("บันทึกการตั้งค่าระบบเรียบร้อย");
  } catch (e) {
    alert("เกิดข้อผิดพลาดในการบันทึก");
  }
};

// --- ฟังก์ชันจัดการสถานะคิว ---

async function updS(id, st) {
  await fetch(`${API}/admin/queues/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: st }),
  });
  loadAll();
}

async function delQ(id) {
  if (confirm("คุณต้องการลบคิวนี้ใช่หรือไม่?")) {
    await fetch(`${API}/bookings/${id}`, { method: "DELETE" });
    loadAll();
  }
}

async function callNxt() {
  try {
    const r = await fetch(`${API}/admin/next-queue`, { method: "POST" });
    const d = await r.json();
    if (d.success) {
      document.getElementById("curQ").textContent = d.queueNumber;
      // เล่นเสียงเรียกคิว
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
      );
      audio.play().catch((e) => console.log("Audio play blocked by browser"));
      loadAll();
    } else {
      alert(d.message);
    }
  } catch (e) {
    alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
  }
}

// --- จองคิวเร่งด่วน ---

document.getElementById("uForm").onsubmit = async (e) => {
  e.preventDefault();
  await fetch(`${API}/admin/urgent-booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: document.getElementById("un").value,
      serviceType: "เร่งด่วน",
      bookingDate: new Date().toISOString().split("T")[0],
      time: "ด่วน",
    }),
  });
  document.getElementById("uModal").classList.add("hidden");
  callNxt();
};

// --- จัดการข้อมูลบริการ (Service CRUD) ---

document.getElementById("srvForm").onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById("sId").value;
  const b = {
    name: document.getElementById("sn").value,
    duration: document.getElementById("sd").value,
    maxQueue: document.getElementById("sm").value,
  };

  try {
    await fetch(id ? `${API}/services/${id}` : `${API}/services`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    document.getElementById("srvForm").reset();
    document.getElementById("sId").value = "";
    loadAll();
  } catch (e) {
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลบริการ");
  }
};

function editS(id, n, d, m) {
  document.getElementById("sId").value = id;
  document.getElementById("sn").value = n;
  document.getElementById("sd").value = d;
  document.getElementById("sm").value = m;
  window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนขึ้นไปให้เห็นฟอร์มแก้
}

async function delS(id) {
  if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบริการนี้?")) {
    await fetch(`${API}/services/${id}`, { method: "DELETE" });
    loadAll();
  }
}
