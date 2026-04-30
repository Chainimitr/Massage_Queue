// ✅ กำหนด API ให้เป็นแบบสัมพัทธ์ เพื่อรองรับ Vercel
const API = "/api";

document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return (location.href = "home.html");

  try {
    // ✅ จุดที่แก้ 1: เปลี่ยนจาก localhost เป็นเรียกใช้ API บน Vercel
    const r = await fetch(`${API}/bookings/${id}`);
    const res = await r.json();

    if (res.success) {
      const d = res.data;
      document.getElementById("qNum").textContent = d.queueNumber;
      document.getElementById("c-srv").textContent = d.serviceType;
      document.getElementById("c-staff").textContent = d.staffName || "ไม่ระบุ";
      document.getElementById("c-name").textContent = d.fullName || "ไม่ระบุ";
      document.getElementById("c-date").textContent = d.bookingDate;
      document.getElementById("c-time").textContent = d.time + " น.";
      document.getElementById("c-loc").textContent =
        d.location || "ศูนย์ราชการ อาคาร A";

      document.getElementById("qrImg").src =
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Q:${d.queueNumber}|T:${d.time}`;

      document.getElementById("loadingText").style.display = "none";
      document.getElementById("tContent").style.display = "block";
    } else {
      alert("ไม่พบข้อมูลการจอง หรือคิวถูกยกเลิกไปแล้ว");
      location.href = "home.html";
    }
  } catch (err) {
    alert("เกิดข้อผิดพลาดในการดึงข้อมูลตั๋ว");
  }

  document.getElementById("cBtn").onclick = async () => {
    if (confirm("คุณต้องการยกเลิกคิวนี้ใช่หรือไม่?")) {
      // ✅ จุดที่แก้ 2: เปลี่ยนจาก localhost เป็นเรียกใช้ API บน Vercel
      await fetch(`${API}/bookings/${id}`, {
        method: "DELETE",
      });
      location.href = "home.html";
    }
  };
});
