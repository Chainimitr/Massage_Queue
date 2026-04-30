// ✅ กำหนด API สัมพัทธ์สำหรับ Vercel
const API = "/api";
let curDate = new Date();
let selDate = "";
let currentStep = 1;

document.addEventListener("DOMContentLoaded", async () => {
  const u = localStorage.getItem("currentUsername");
  if (u && u !== "admin") document.getElementById("fName").value = u;

  // 1. โหลดบริการ
  try {
    const res = await fetch(`${API}/services`);
    const srvs = await res.json();
    const sel = document.getElementById("sType");
    sel.innerHTML =
      '<option value="" disabled selected>-- เลือกบริการที่ต้องการ --</option>';
    srvs.forEach((s) => {
      sel.innerHTML += `<option value="${s.name}">${s.name} (ใช้เวลา ${s.duration} นาที)</option>`;
    });
  } catch (e) {
    console.error("Load services error:", e);
  }

  // 2. โหลดรายชื่อเจ้าหน้าที่แบบ Card Layout
  try {
    const resStaff = await fetch(`${API}/staff`);
    const staffs = await resStaff.json();
    const grid = document.getElementById("staff-grid");
    grid.innerHTML = "";

    staffs.forEach((s, index) => {
      const card = document.createElement("div");
      card.className = "staff-card";
      card.style.animationDelay = `${index * 0.1}s`;

      card.innerHTML = `
                <img src="${s.image}" alt="${s.name}" class="staff-img" onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
                <div class="staff-name">${s.name}</div>
                <div class="staff-role">${s.role}</div>
            `;

      card.onclick = () => {
        document
          .querySelectorAll(".staff-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        const finalName =
          s.id === "4" ? s.name : `เจ้าหน้าที่${s.name} (${s.role})`;
        document.getElementById("staff").value = finalName;
      };

      grid.appendChild(card);
    });
  } catch (e) {
    document.getElementById("staff-grid").innerHTML =
      '<p style="color:red; grid-column:1/-1;">เกิดข้อผิดพลาดในการโหลดเจ้าหน้าที่</p>';
  }

  renderCal();

  document.getElementById("pMo").onclick = () => {
    curDate.setMonth(curDate.getMonth() - 1);
    renderCal();
  };
  document.getElementById("nMo").onclick = () => {
    curDate.setMonth(curDate.getMonth() + 1);
    renderCal();
  };

  document.getElementById("sType").onchange = () => {
    selDate = "";
    document.getElementById("bDate").value = "";
    document.getElementById("tSlots").innerHTML =
      '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#888;">โปรดเลือกวันที่บนปฏิทินอีกครั้ง</div>';
    renderCal();
  };

  document.getElementById("nextBtn").onclick = () => nextStep();
  document.getElementById("prevBtn").onclick = () => prevStep();
});

// ================= ระบบ Wizard Navigation =================
function updateWizardUI() {
  document.querySelectorAll(".form-step").forEach((el, index) => {
    if (index + 1 === currentStep) el.classList.add("active");
    else el.classList.remove("active");
  });

  document.getElementById("progressLine").style.width =
    (currentStep - 1) * 50 + "%";

  for (let i = 1; i <= 3; i++) {
    const ind = document.getElementById(`ind-${i}`);
    const label = ind.querySelector(".step-label").innerText;
    if (i < currentStep) {
      ind.className = "step-indicator completed";
      ind.innerHTML = `<i class="fa-solid fa-check"></i><span class="step-label">${label}</span>`;
    } else if (i === currentStep) {
      ind.className = "step-indicator active";
      ind.innerHTML = `${i}<span class="step-label">${label}</span>`;
    } else {
      ind.className = "step-indicator";
      ind.innerHTML = `${i}<span class="step-label">${label}</span>`;
    }
  }

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const spacer = document.getElementById("btnSpacer");

  if (currentStep === 1) {
    prevBtn.style.display = "none";
    spacer.style.display = "block";
  } else {
    prevBtn.style.display = "block";
    spacer.style.display = "none";
  }

  if (currentStep === 3) {
    nextBtn.style.display = "none";
    submitBtn.style.display = "block";

    document.getElementById("sumService").textContent =
      document.getElementById("sType").value;
    document.getElementById("sumStaff").textContent =
      document.getElementById("staff").value;
    document.getElementById("sumLoc").textContent =
      document.getElementById("loc").value;
    document.getElementById("sumDate").textContent =
      document.getElementById("bDate").value;
    document.getElementById("sumTime").textContent =
      document.getElementById("sTime").value;
  } else {
    nextBtn.style.display = "block";
    submitBtn.style.display = "none";
  }
}

function nextStep() {
  if (currentStep === 1) {
    const sType = document.getElementById("sType").value;
    const loc = document.getElementById("loc").value;
    const staff = document.getElementById("staff").value;
    if (!sType || !loc || !staff) {
      alert("กรุณาเลือกบริการ, สถานที่ และเจ้าหน้าที่ให้ครบถ้วน");
      return;
    }
  }

  if (currentStep === 2) {
    if (
      !document.getElementById("bDate").value ||
      !document.getElementById("sTime").value
    ) {
      alert("กรุณาเลือกวันและเวลาที่ต้องการรับบริการ");
      return;
    }
  }

  if (currentStep < 3) {
    currentStep++;
    updateWizardUI();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateWizardUI();
  }
}

// ================= ระบบปฏิทิน =================
async function renderCal() {
  const y = curDate.getFullYear(),
    m = curDate.getMonth();
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  document.getElementById("mDisp").textContent = `${thaiMonths[m]} ${y}`;

  const fDay = new Date(y, m, 1).getDay(),
    dInM = new Date(y, m + 1, 0).getDate();
  const ymStr = `${y}-${String(m + 1).padStart(2, "0")}`,
    tStr = new Date().toISOString().split("T")[0];
  const srv = document.getElementById("sType").value;

  let stats = { counts: {}, maxSlotsPerDay: 0, settings: null };
  if (srv) {
    try {
      const r = await fetch(
        `${API}/month-status?month=${ymStr}&service=${encodeURIComponent(srv)}`,
      );
      if (r.ok) stats = await r.json();
    } catch (e) {
      console.error("Load month status error:", e);
    }
  }

  const dBox = document.getElementById("cDays");
  dBox.innerHTML = "";
  for (let i = 0; i < fDay; i++)
    dBox.appendChild(document.createElement("div"));

  const sysSet = stats.settings;

  for (let d = 1; d <= dInM; d++) {
    const dStr = `${ymStr}-${String(d).padStart(2, "0")}`;
    const div = document.createElement("div");
    div.className = "cal-day-box";
    div.innerHTML = `<span class="day-num">${d}</span>`;

    const dayOfWeek = new Date(y, m, d).getDay();
    const isHoliday = sysSet && sysSet.holidays.includes(dStr);
    const isWorkingDay = sysSet ? sysSet.workingDays.includes(dayOfWeek) : true;

    if (dStr < tStr || !srv) {
      div.classList.add("disabled");
      div.innerHTML += `<span class="queue-text">${srv ? "ผ่านมาแล้ว" : "เลือกบริการก่อน"}</span>`;
    } else if (!isWorkingDay || isHoliday) {
      div.classList.add("disabled");
      div.innerHTML += `<span class="queue-text" style="color:#d93025;"><i class="fa-solid fa-store-slash"></i> วันหยุด</span>`;
    } else {
      const b = stats.counts[dStr] || 0,
        a = stats.maxSlotsPerDay - b;
      if (a <= 0) {
        div.classList.add("disabled");
        div.innerHTML += `<span class="queue-text full"><i class="fa-solid fa-ban"></i> เต็ม</span>`;
      } else {
        div.innerHTML += `<span class="queue-text"><i class="fa-solid fa-check"></i> ว่าง ${a}</span>`;
        div.onclick = () => selDay(dStr, div);
      }
      if (dStr === selDate) div.classList.add("selected");
    }
    dBox.appendChild(div);
  }
}

function selDay(dStr, el) {
  document
    .querySelectorAll(".cal-day-box")
    .forEach((e) => e.classList.remove("selected"));
  el.classList.add("selected");
  selDate = dStr;
  document.getElementById("bDate").value = dStr;
  loadTimes(dStr);
}

async function loadTimes(d) {
  const srv = document.getElementById("sType").value,
    tBox = document.getElementById("tSlots");
  tBox.innerHTML =
    '<div style="grid-column:1/-1; text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px; color:#ff66a3;"></i><br>กำลังตรวจสอบคิว...</div>';
  document.getElementById("sTime").value = "";
  try {
    const r = await fetch(
      `${API}/timeslots?date=${d}&service=${encodeURIComponent(srv)}`,
    );
    const data = await r.json();
    tBox.innerHTML = "";
    if (!data.slots.length)
      return (tBox.innerHTML =
        '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#d93025; background:#fff0f0; border-radius:12px;">ไม่มีคิวให้บริการในวันนี้</div>');

    data.slots.forEach((s, idx) => {
      const dElem = document.createElement("div");
      dElem.textContent = s.time;
      dElem.className = `time-slot ${s.status}`;
      dElem.style.animationDelay = `${idx * 0.05}s`;

      if (s.status === "available") {
        dElem.onclick = () => {
          document
            .querySelectorAll(".time-slot")
            .forEach((e) => e.classList.remove("selected"));
          dElem.classList.add("selected");
          document.getElementById("sTime").value = s.time;
        };
      } else {
        dElem.textContent += " (เต็ม)";
      }
      tBox.appendChild(dElem);
    });
  } catch (e) {
    tBox.innerHTML =
      '<div style="grid-column:1/-1; text-align:center; color:#d93025;">เกิดข้อผิดพลาด</div>';
  }
}

// ================= ยืนยันการส่งข้อมูล (Submit) =================
document.getElementById("bkForm").onsubmit = async (e) => {
  e.preventDefault();

  const btn = document.getElementById("submitBtn"),
    alertBox = document.getElementById("bAlert");
  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึกข้อมูล...';
  btn.disabled = true;

  const body = {
    username: localStorage.getItem("currentUsername"),
    serviceType: document.getElementById("sType").value,
    staffName: document.getElementById("staff").value,
    bookingDate: document.getElementById("bDate").value,
    time: document.getElementById("sTime").value,
    location: document.getElementById("loc").value,
    fullName: document.getElementById("fName").value,
    phone: document.getElementById("tel").value,
    email: document.getElementById("email").value,
    status: "รอดำเนินการ",
  };

  try {
    const r = await fetch(`${API}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();

    alertBox.textContent = d.message;
    alertBox.className = `alert ${d.success ? "success" : "error"}`;
    alertBox.style.display = "block";

    if (d.success) {
      setTimeout(
        () => (window.location.href = `confirmation.html?id=${d.bookingId}`),
        1000,
      );
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> ยืนยันการจองคิว';
    }
  } catch (e) {
    alertBox.textContent = "ไม่สามารถบันทึกได้ โปรดลองอีกครั้ง";
    alertBox.className = "alert error";
    alertBox.style.display = "block";
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> ยืนยันการจองคิว';
  }
};
