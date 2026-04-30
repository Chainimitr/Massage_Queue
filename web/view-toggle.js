// // web/view-toggle.js

// document.addEventListener("DOMContentLoaded", () => {
//   // 1. ตรวจสอบว่าหน้าปัจจุบันใช่หน้า admin หรือไม่
//   // ✅ แก้ไข: Vercel มักจะตัด .html ออกเวลาแสดงผล URL จึงเช็คแค่คำว่า admin กับ users ก็พอครับ
//   const currentPath = window.location.pathname.toLowerCase();
//   const isAdminPage =
//     currentPath.includes("admin") || currentPath.includes("users");

//   // ถ้าเป็นหน้า Admin หรือหน้า Users ไม่ต้องทำอะไรเลย (ยกเลิกการทำงาน)
//   if (isAdminPage) return;

//   // 2. สร้างปุ่มสลับโหมด
//   const toggleBtn = document.createElement("button");
//   toggleBtn.className = "view-toggle-btn";
//   document.body.appendChild(toggleBtn);

//   // 3. ฟังก์ชันอัปเดตหน้าตาปุ่มและ Layout
//   function applyViewMode() {
//     const isMobileView = localStorage.getItem("forceMobileView") === "true";

//     if (isMobileView) {
//       document.body.classList.add("force-mobile-view");
//       toggleBtn.innerHTML =
//         '<i class="fa-solid fa-desktop"></i> เปลี่ยนเป็นจอ PC';
//       toggleBtn.style.background = "#1a73e8"; // สีฟ้า
//     } else {
//       document.body.classList.remove("force-mobile-view");
//       toggleBtn.innerHTML =
//         '<i class="fa-solid fa-mobile-screen-button"></i> ดูแบบจอมือถือ';
//       toggleBtn.style.background = "#1a1a1a"; // สีดำ
//     }
//   }

//   // 4. โหลดค่าเริ่มต้นทันทีที่เปิดหน้าเว็บ
//   applyViewMode();

//   // 5. เมื่อกดปุ่ม ให้สลับโหมดและบันทึกค่าลง localStorage
//   toggleBtn.addEventListener("click", () => {
//     const currentMode = localStorage.getItem("forceMobileView") === "true";
//     // สลับค่า (ถ้าเป็น true ให้เป็น false, ถ้า false ให้เป็น true)
//     localStorage.setItem("forceMobileView", !currentMode);
//     applyViewMode();
//   });
// });
