// ✅ เพิ่มตัวแปร API ให้รองรับ Vercel
const API = "/api";

document.addEventListener("DOMContentLoaded", fetchMyBookings);

async function fetchMyBookings() {
  const username = localStorage.getItem("currentUsername");
  const container = document.getElementById("bookingList");
  const emptyMsg = document.getElementById("noBookingMessage");

  // ถ้าไม่ได้ล็อกอิน ให้เด้งกลับไปหน้าแรก
  if (!username) {
    window.location.href = "index.html";
    return;
  }

  try {
    // ✅ แก้จุดที่ 1: เปลี่ยนจาก localhost เป็นเรียกใช้ API สัมพัทธ์
    const response = await fetch(`${API}/my-bookings?username=${username}`);
    const bookings = await response.json();

    // กรณีไม่มีคิว ให้แสดงหน้า Empty State
    if (bookings.length === 0) {
      emptyMsg.classList.remove("hidden");
      container.innerHTML = "";
      return;
    }

    // กรณีมีคิว ให้ซ่อนหน้า Empty State แล้วเรียงการ์ด
    emptyMsg.classList.add("hidden");

    // เรียงคิวจากวันที่ใหม่ล่าสุดขึ้นก่อน
    bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    container.innerHTML = bookings
      .map((b, index) => {
        // กำหนดสีและไอคอนตามสถานะของคิว
        let cardClass = "";
        let badgeClass = "";
        let statusIcon = "";

        if (b.status === "รอดำเนินการ") {
          cardClass = "card-wait";
          badgeClass = "badge-wait";
          statusIcon = '<i class="fa-solid fa-hourglass-half"></i>';
        } else if (b.status === "กำลังให้บริการ") {
          cardClass = "card-serve";
          badgeClass = "badge-serve";
          statusIcon = '<i class="fa-solid fa-bullhorn fa-shake"></i>';
        } else if (b.status === "เสร็จสิ้น") {
          cardClass = "card-done";
          badgeClass = "badge-done";
          statusIcon = '<i class="fa-solid fa-check-double"></i>';
        }

        // หน่วงเวลาแอนิเมชันให้การ์ดค่อยๆ เด้งขึ้นมาทีละใบ
        const animDelay = index * 0.1;

        return `
            <div class="my-booking-card ${cardClass}" style="animation-delay: ${animDelay}s;">
                <div class="booking-info">
                    <span style="font-size: 12px; color: #888; font-weight: 600; letter-spacing: 1px;">หมายเลขคิว: <span style="color:#ff66a3;">${b.queueNumber}</span></span>
                    <h3 style="margin-top: 5px;">${b.serviceType}</h3>
                    
                    <div style="display: flex; gap: 15px; margin-top: 10px; flex-wrap: wrap;">
                        <p style="margin: 0; font-size: 13px;"><i class="fa-regular fa-calendar-days" style="color:#ccc;"></i> <strong>วันที่:</strong> ${b.bookingDate}</p>
                        <p style="margin: 0; font-size: 13px;"><i class="fa-regular fa-clock" style="color:#ccc;"></i> <strong>เวลา:</strong> ${b.time} น.</p>
                        <p style="margin: 0; font-size: 13px;"><i class="fa-solid fa-location-dot" style="color:#ccc;"></i> <strong>สถานที่:</strong> ${b.location || "ศูนย์ราชการ อาคาร A"}</p>
                    </div>
                    
                    <span class="status-badge ${badgeClass}">
                        ${statusIcon} ${b.status || "รอดำเนินการ"}
                    </span>
                </div>

                <div class="booking-actions">
                    <button onclick="viewTicket('${b.id}')" class="action-btn btn-view-ticket">
                        <i class="fa-solid fa-ticket"></i> ดูตั๋ว
                    </button>
                    ${
                      b.status !== "เสร็จสิ้น"
                        ? `
                    <button onclick="cancelBooking('${b.id}')" class="action-btn btn-cancel">
                        <i class="fa-solid fa-ban"></i> ยกเลิก
                    </button>
                    `
                        : ""
                    }
                </div>
            </div>
            `;
      })
      .join("");
  } catch (error) {
    container.innerHTML =
      '<p class="text-center" style="color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
  }
}

// ฟังก์ชันเปิดกลับไปดูหน้าตั๋ว QR Code
function viewTicket(id) {
  window.location.href = `confirmation.html?id=${id}`;
}

// ฟังก์ชันยกเลิกคิว
async function cancelBooking(id) {
  if (
    confirm(
      'คุณแน่ใจหรือไม่ว่าต้องการ "ยกเลิกคิว" นี้?\n(การกระทำนี้ไม่สามารถย้อนกลับได้)',
    )
  ) {
    try {
      // ✅ แก้จุดที่ 2: เปลี่ยนจาก localhost เป็นเรียกใช้ API สัมพัทธ์
      await fetch(`${API}/bookings/${id}`, {
        method: "DELETE",
      });
      // โหลดรายการใหม่หลังจากลบเสร็จ
      fetchMyBookings();
    } catch (e) {
      alert("ไม่สามารถดำเนินการได้ในขณะนี้");
    }
  }
}
