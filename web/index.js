document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const u = document.getElementById("username").value,
    p = document.getElementById("password").value;
  const btn = document.getElementById("submitBtn"),
    alertBox = document.getElementById("alertMsg");
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังตรวจสอบ...';
  btn.disabled = true;
  alertBox.className = "alert hidden";

  try {
    // ✅ แก้จุดนี้แล้วครับ! เปลี่ยนจาก http://localhost:3000/api/login เป็น /api/login
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });

    const data = await res.json();
    alertBox.textContent = data.message;
    alertBox.classList.remove("hidden");
    alertBox.classList.add(data.success ? "success" : "error");

    if (data.success) {
      localStorage.setItem("currentUsername", u);
      setTimeout(
        () =>
          (window.location.href = u === "admin" ? "admin.html" : "home.html"),
        1000,
      );
    } else {
      btn.disabled = false;
      btn.innerHTML =
        '<i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ';
    }
  } catch (err) {
    alertBox.textContent = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
    alertBox.className = "alert error";
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ';
  }
});
