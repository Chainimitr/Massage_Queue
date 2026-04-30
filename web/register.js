document.getElementById("regForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const u = document.getElementById("reg-user").value,
    p = document.getElementById("reg-pass").value;
  const btn = document.getElementById("regBtn"),
    alertBox = document.getElementById("regAlert");
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...';
  btn.disabled = true;
  alertBox.className = "alert hidden";
  try {
    // ✅ จุดที่แก้: เปลี่ยน http://localhost:3000/api/register เป็น /api/register
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });
    const data = await res.json();
    alertBox.textContent = data.message;
    alertBox.className = `alert ${data.success ? "success" : "error"}`;

    if (data.success)
      setTimeout(() => (window.location.href = "index.html"), 1500);
    else {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> ยืนยันการสมัคร';
    }
  } catch (err) {
    alertBox.textContent = "เชื่อมต่อไม่ได้";
    alertBox.className = "alert error";
    btn.disabled = false;
    btn.innerHTML = "ยืนยันการสมัคร";
  }
});
