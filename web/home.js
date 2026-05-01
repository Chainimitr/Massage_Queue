document.addEventListener("DOMContentLoaded", () => {
  // 1. เช็คการล็อกอิน
  const user = localStorage.getItem("currentUsername");
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // 2. ระบบทักทายอัจฉริยะ (Smart Greeting) ตามเวลาประเทศไทย
  // ✅ บังคับดึงชั่วโมงปัจจุบันเป็นเวลาประเทศไทย (Asia/Bangkok) เสมอ
  const currentHourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    hour: 'numeric',
    hourCycle: 'h23' // ใช้ระบบ 0-23 นาฬิกา
  }).format(new Date());
  
  const currentHour = parseInt(currentHourStr, 10);
  let greetingText = "สวัสดี";

  // ✅ ใช้ FontAwesome Icons แทนอิโมจิ พร้อมใส่สีให้เข้ากับช่วงเวลา
  if (currentHour >= 5 && currentHour < 12) {
    greetingText = 'อรุณสวัสดิ์ <i class="fa-solid fa-cloud-sun" style="color: #f6b93b;"></i>';
  } else if (currentHour >= 12 && currentHour < 17) {
    greetingText = 'สวัสดีตอนบ่าย <i class="fa-solid fa-sun fa-spin-pulse" style="color: #f39c12;"></i>';
  } else if (currentHour >= 17 && currentHour < 22) {
    greetingText = 'สวัสดีตอนเย็น <i class="fa-solid fa-cloud-moon" style="color: #8e44ad;"></i>';
  } else {
    greetingText = 'สวัสดีตอนค่ำ <i class="fa-solid fa-moon" style="color: #f1c40f;"></i>';
  }

  // แทรกข้อความลงใน HTML พร้อมเปลี่ยนไอคอนมือโบกเป็น FontAwesome
  const greetingElement = document.getElementById("dynamicGreeting");
  if (greetingElement) {
    greetingElement.innerHTML = `${greetingText}, คุณ ${user} <i class="fa-solid fa-hand wave-hand" style="color: #ffcd56; margin-left: 8px;"></i>`;
  }
});

// 3. ระบบออกจากระบบ (Logout)
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการ "ออกจากระบบ"?')) {
    localStorage.removeItem("currentUsername");
    window.location.href = "index.html";
  }
});
