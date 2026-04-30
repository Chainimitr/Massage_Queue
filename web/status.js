// ✅ กำหนด API ให้เป็นแบบสัมพัทธ์ เพื่อรองรับ Vercel
const API = "/api";

document.getElementById("sForm").onsubmit = async (e) => {
  e.preventDefault();
  const q = document.getElementById("sInp").value.trim();
  const alertBox = document.getElementById("sAlert");
  const resBox = document.getElementById("sRes");
  const submitBtn = document.querySelector("#sForm button");

  // รีเซ็ตการแสดงผล
  resBox.style.display = "none";
  alertBox.className = "alert hidden";
  document.getElementById("rProgress").style.width = "0%"; // รีเซ็ตกราฟ

  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  submitBtn.disabled = true;

  try {
    // ✅ จุดที่แก้: เปลี่ยนลิงก์ให้ชี้ไปที่ /api/check-queue
    const r = await fetch(`${API}/check-queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queueNumber: q }),
    });

    const d = await r.json();

    if (d.success) {
      // ใส่ข้อมูลลงในการ์ด
      document.getElementById("rCur").textContent = d.data.currentQueue;
      document.getElementById("rMy").textContent = d.data.myQueue;
      document.getElementById("rAh").textContent = `${d.data.peopleAhead} คิว`;
      document.getElementById("rTime").textContent =
        `~ ${d.data.estimatedWaitTime} นาที`;
      document.getElementById("r-service").textContent = d.data.service;
      document.getElementById("r-date").textContent = d.data.date;
      document.getElementById("r-time").textContent = `${d.data.time} น.`;

      // คำนวณหลอด Progress Bar (สมมติว่าถ้ารอ 0 คิว คือ 100%, ถ้ารอ 10 คิวขึ้นไปคือ 10%)
      let progressPercent = 100 - d.data.peopleAhead * 10;
      if (progressPercent < 10) progressPercent = 10; // ขั้นต่ำ 10% ให้เห็นว่าอยู่ในคิวแล้ว
      if (d.data.peopleAhead === 0) progressPercent = 100; // ถึงคิวแล้ว!

      // อัปเดตข้อความบนหลอด
      const statusText = document.getElementById("rStatusText");
      if (d.data.peopleAhead === 0) {
        statusText.innerHTML =
          '<span style="color:#1e8e3e;"><i class="fa-solid fa-circle-check"></i> ถึงคิวของคุณแล้ว! เชิญที่ช่องบริการ</span>';
      } else if (d.data.peopleAhead <= 2) {
        statusText.innerHTML =
          '<span style="color:#ff66a3;"><i class="fa-solid fa-bell"></i> ใกล้ถึงคิวของคุณแล้ว กรุณาเตรียมตัว</span>';
      } else {
        statusText.innerHTML = "สถานะ: กำลังรอเรียกคิว";
      }

      // แสดงกล่องผลลัพธ์
      resBox.style.display = "block";

      // ดีเลย์นิดนึงเพื่อให้แอนิเมชันหลอดกราฟวิ่งลื่นไหล
      setTimeout(() => {
        document.getElementById("rProgress").style.width =
          `${progressPercent}%`;
      }, 300);
    } else {
      alertBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${d.message}`;
      alertBox.className = "alert error";
    }
  } catch (err) {
    alertBox.innerHTML =
      '<i class="fa-solid fa-link-slash"></i> ไม่สามารถเชื่อมต่อระบบได้';
    alertBox.className = "alert error";
  } finally {
    submitBtn.innerHTML = '<i class="fa-solid fa-search"></i> ค้นหาคิว';
    submitBtn.disabled = false;
  }
};
