window.addItem = addItem;
window.deleteItem = deleteItem;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc }
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.addItem = addItem;
window.deleteItem = deleteItem;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;

const firebaseConfig = {
  apiKey: "AIzaSyCsCJrtnRzsb_kAacqb2Q5JacJMNUP8C8w",
  authDomain: "schedulemanager-6c27d.firebaseapp.com",
  projectId: "schedulemanager-6c27d",
  storageBucket: "schedulemanager-6c27d.firebasestorage.app",
  messagingSenderId: "132654712821",
  appId: "1:132654712821:web:e47f43f3bf1e5d5ab9c2bc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksRef = collection(db, "tasks");

let currentYear;
let currentMonth;

async function addItem() {
    const kind = document.getElementById("kind").value;
    const subject = document.getElementById("subject").value;
    const date = document.getElementById("date").value;
    const detail = document.getElementById("detail").value;
    const subjectMemo = document.getElementById("subjectMemo").value;

    if (!subject || !date) {
        alert("科目・日付は必須です");
        return;
    }

    await addDoc(tasksRef, {
        kind, subject, date, detail, subjectMemo
    });

    load();
}

async function load() {
    const list = document.getElementById("list");
    list.innerHTML = "";

    const snapshot = await getDocs(tasksRef);
    const tasks = [];

    snapshot.forEach(docSnap => {
        tasks.push({ id: docSnap.id, ...docSnap.data() });
    });

    tasks.forEach(item => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <strong>${item.kind}</strong> (${item.subject})<br>
            日付: ${item.date}<br>
            教科メモ: ${item.subjectMemo || "（なし）"}<br>
            メモ: ${item.detail}<br>
            <button onclick="deleteItem('${item.id}')">削除</button>
        `;
        list.appendChild(div);
    });

    renderCalendar(tasks);
}

async function deleteItem(id) {
    await deleteDoc(doc(db, "tasks", id));
    load();
}

function renderCalendar(tasks) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const monthHeader = document.getElementById("monthHeader");
    monthHeader.textContent = `${currentYear}年 ${currentMonth + 1}月`;

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    weekdays.forEach(w => {
        const header = document.createElement("div");
        header.className = "day-header";
        header.textContent = w;
        calendar.appendChild(header);
    });

    for (let i = 0; i < startWeekday; i++) {
        const empty = document.createElement("div");
        empty.className = "day";
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "day";
        cell.innerHTML = `<strong>${day}</strong><br>`;

        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        tasks.forEach(t => {
            if (t.date === dateStr) {
                const event = document.createElement("div");
                event.className = "event";
                event.textContent = `${t.kind}: ${t.subject}`;
                cell.appendChild(event);
            }
        });

        calendar.appendChild(cell);
    }
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    load();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    load();
}

function initCalendar() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    load();
}

initCalendar();
