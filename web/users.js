// ✅ แก้ไขจาก http://localhost:3000/api เป็น /api เพื่อให้ทำงานบน Vercel ได้
const API = "/api";
let allUsers = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchUsers();

  // ระบบค้นหาผู้ใช้ (ค้นหาทันทีที่พิมพ์)
  document
    .getElementById("searchInput")
    .addEventListener("keyup", function (e) {
      const term = e.target.value.toLowerCase();
      renderUsers(term);
    });
});

async function fetchUsers() {
  try {
    const response = await fetch(`${API}/admin/users-list`);
    allUsers = await response.json();
    renderUsers(""); // โชว์ทั้งหมดในตอนแรก
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// วาดตาราง โดยมีระบบ Filter (ค้นหา)
function renderUsers(searchTerm) {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  // กรองข้อมูลตามที่ค้นหา
  const filteredUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(searchTerm),
  );

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 30px; color:#888;">ไม่มีข้อมูลผู้ใช้นี้ในระบบ</td></tr>`;
    return;
  }

  filteredUsers.forEach((u) => {
    const badgeClass = u.status === "active" ? "active" : "blocked";
    const blockBtnClass = u.status === "blocked" ? "btn-unblock" : "btn-block";
    const blockBtnText =
      u.status === "blocked"
        ? '<i class="fa-solid fa-unlock"></i> ปลดแบน'
        : '<i class="fa-solid fa-lock"></i> ระงับบัญชี';

    const row = document.createElement("tr");
    row.innerHTML = `
            <td><strong><i class="fa-solid fa-user" style="color:#ccc; margin-right:8px;"></i> ${u.username}</strong></td>
            <td>${u.bookingCount} รายการ</td>
            <td><span class="user-badge ${badgeClass}">${u.status}</span></td>
            <td style="text-align: right;">
                <button onclick="viewHistory('${u.username}')" class="action-btn btn-history" title="ดูประวัติการจอง"><i class="fa-solid fa-clock-rotate-left"></i></button>
                <button onclick="openPwdModal('${u.username}')" class="action-btn btn-edit" title="เปลี่ยนรหัสผ่าน" style="background:#fff3e0; color:#fbbc04;"><i class="fa-solid fa-key"></i></button>
                <button onclick="toggleUserStatus('${u.username}')" class="action-btn ${blockBtnClass}" title="ระงับการใช้งาน">${blockBtnText}</button>
                <button onclick="deleteUser('${u.username}')" class="action-btn btn-cancel" title="ลบบัญชีผู้ใช้"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

// --- ฟังก์ชันจัดการข้อมูล (CRUD) ---

async function toggleUserStatus(username) {
  if (confirm(`คุณต้องการเปลี่ยนสถานะการใช้งานของ "${username}" ใช่หรือไม่?`)) {
    await fetch(`${API}/admin/users/${username}/toggle-block`, {
      method: "PUT",
    });
    fetchUsers(); // รีเฟรชตาราง
  }
}

async function deleteUser(username) {
  if (
    confirm(
      `🚨 คำเตือน! คุณต้องการลบบัญชี "${username}" อย่างถาวรใช่หรือไม่?\n(ข้อมูลการจองทั้งหมดของผู้ใช้นี้จะถูกลบไปด้วย)`,
    )
  ) {
    try {
      const res = await fetch(`${API}/admin/users/${username}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers(); // รีเฟรชตาราง
      } else {
        alert("ไม่สามารถลบผู้ใช้นี้ได้");
      }
    } catch (e) {
      console.error(e);
    }
  }
}

function viewHistory(username) {
  const user = allUsers.find((x) => x.username === username);
  document.getElementById("hTitle").innerHTML =
    `<i class="fa-solid fa-clock-rotate-left"></i> ประวัติของ: ${username}`;

  if (user.history.length === 0) {
    document.getElementById("hTb").innerHTML =
      '<tr><td colspan="4" class="text-center" style="color:#888;">ยังไม่เคยทำการจองคิว</td></tr>';
  } else {
    document.getElementById("hTb").innerHTML = user.history
      .map(
        (h) => `
            <tr>
                <td>${h.bookingDate}<br><span style="font-size:11px; color:#888;">${h.time} น.</span></td>
                <td><b>${h.queueNumber}</b></td>
                <td>${h.serviceType}</td>
                <td><span class="user-badge ${h.status === "เสร็จสิ้น" ? "active" : h.status === "ยกเลิก" ? "blocked" : ""}">${h.status}</span></td>
            </tr>
        `,
      )
      .join("");
  }
  document.getElementById("hModal").classList.remove("hidden");
}

// --- ระบบเปลี่ยนรหัสผ่าน ---
function openPwdModal(username) {
  document.getElementById("pwdTargetUser").textContent = username;
  document.getElementById("pwdUsername").value = username;
  document.getElementById("newPwd").value = "";
  document.getElementById("pwdModal").classList.remove("hidden");
}

document.getElementById("pwdForm").onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById("pwdUsername").value;
  const newPassword = document.getElementById("newPwd").value;

  try {
    const res = await fetch(`${API}/admin/users/${username}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();

    if (data.success) {
      alert(`เปลี่ยนรหัสผ่านของบัญชี ${username} เรียบร้อยแล้ว`);
      document.getElementById("pwdModal").classList.add("hidden");
    } else {
      alert("เกิดข้อผิดพลาด ไม่สามารถเปลี่ยนรหัสผ่านได้");
    }
  } catch (err) {
    console.error(err);
  }
};
