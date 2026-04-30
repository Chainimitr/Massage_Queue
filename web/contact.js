document.addEventListener("DOMContentLoaded", () => {
  // 1. สั่งให้เช็คเวลาทำการทันทีที่เปิดหน้าเว็บเสร็จ
  updateOfficeStatus();

  // 2. ตั้งเวลาให้เช็คซ้ำทุกๆ 1 นาที (60,000 มิลลิวินาที)
  // เผื่อกรณีผู้ใช้เปิดหน้าเว็บทิ้งไว้จนเลยเวลาปิดทำการ ระบบจะได้อัปเดตสีอัตโนมัติ
  setInterval(updateOfficeStatus, 60000);
});

// ==========================================
// ฟังก์ชันเช็คเวลาทำการแบบ Real-time
// ==========================================
function updateOfficeStatus() {
  const now = new Date();
  const day = now.getDay(); // 0 = วันอาทิตย์, 1 = จันทร์ ... 5 = ศุกร์, 6 = เสาร์
  const hour = now.getHours();

  const statusBox = document.getElementById("officeStatusBox");
  const badge = document.getElementById("liveBadge");
  const dot = document.getElementById("liveDot");
  const text = document.getElementById("liveText");

  if (!statusBox) return; // ป้องกัน Error ถ้าหา Element ไม่เจอ

  // เงื่อนไข: วันจันทร์(1) ถึง วันศุกร์(5) และ เวลาตั้งแต่ 09:00 ถึงก่อน 16:00 (15:59 น.)
  if (day >= 1 && day <= 5 && hour >= 9 && hour < 16) {
    // อยู่ในเวลาทำการ -> ออนไลน์ (สีเขียวกะพริบ)
    statusBox.className = "status-box border-online";
    badge.className = "live-badge is-online";
    dot.className = "dot-online";
    text.textContent = "แอดมินออนไลน์";
  } else {
    // นอกเวลาทำการ -> ออฟไลน์ (สีแดง หยุดกะพริบ)
    statusBox.className = "status-box border-offline";
    badge.className = "live-badge is-offline";
    dot.className = "dot-offline";
    text.textContent = "นอกเวลาทำการ";
  }
}

// ==========================================
// ฟังก์ชันคัดลอก LINE ID พร้อมลูกเล่น
// ==========================================
function copyLineID(id) {
  navigator.clipboard
    .writeText(id)
    .then(() => {
      const titleBox = document.getElementById("lineTitle");
      const textBox = document.getElementById("lineText");
      const iconBox = document.getElementById("lineAction");
      const rowBox = document.getElementById("lineBtnBox");

      // เอฟเฟกต์ตอนกด Copy สำเร็จ (เปลี่ยนสีเพื่อตอบสนองการคลิก)
      rowBox.style.background = "linear-gradient(135deg, #009900, #007700)";
      titleBox.innerHTML = "คัดลอกสำเร็จ!";
      textBox.innerHTML = "เปิดแอป LINE เพื่อเพิ่มเพื่อน";

      iconBox.innerHTML = '<i class="fa-solid fa-check"></i> คัดลอกแล้ว';
      iconBox.style.background = "#fff";
      iconBox.style.color = "#00B900";

      // คืนค่ากลับสู่สภาพเดิมหลังจากผ่านไป 2.5 วินาที
      setTimeout(() => {
        rowBox.style.background = ""; // ลบ Style ทิ้งเพื่อให้กลับไปใช้ CSS เดิม
        titleBox.innerHTML = "LINE Official";
        textBox.innerHTML = id;

        iconBox.innerHTML = '<i class="fa-solid fa-copy"></i> คัดลอก ID';
        iconBox.style.background = "";
        iconBox.style.color = "";
      }, 2500);
    })
    .catch((err) => {
      console.error("ไม่สามารถคัดลอกข้อความได้: ", err);
      alert("เกิดข้อผิดพลาดในการคัดลอก ID");
    });
}
