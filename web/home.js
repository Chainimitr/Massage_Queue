document.addEventListener("DOMContentLoaded", () => {
  // 1. เช็คการล็อกอิน
  const user = localStorage.getItem("currentUsername");
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // 2. ระบบทักทายอัจฉริยะ (Smart Greeting) ตามช่วงเวลา
  const currentHour = new Date().getHours();
  let greetingText = "สวัสดี";

  if (currentHour >= 5 && currentHour < 12) {
    greetingText = "อรุณสวัสดิ์ ⛅";
  } else if (currentHour >= 12 && currentHour < 17) {
    greetingText = "สวัสดีตอนบ่าย ☀️";
  } else if (currentHour >= 17 && currentHour < 22) {
    greetingText = "สวัสดีตอนเย็น 🌆";
  } else {
    greetingText = "สวัสดีตอนค่ำ 🌙";
  }

  // แทรกข้อความลงใน HTML พร้อมไอคอนมือโบก
  const greetingElement = document.getElementById("dynamicGreeting");
  if (greetingElement) {
    greetingElement.innerHTML = `${greetingText}, คุณ ${user} <span class="wave-hand">👋</span>`;
  }
});

// 3. ระบบออกจากระบบ (Logout)
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการ "ออกจากระบบ"?')) {
    localStorage.removeItem("currentUsername");
    window.location.href = "index.html";
  }
});
