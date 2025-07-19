// analysis.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
const tableBody = document.querySelector("#resultsTable tbody");


const firebaseConfig = {
  apiKey: "AIzaSyB_hiukwxN-ftyTQjhn7bwkvq0UntljUW4",
  authDomain: "ideation-tool-8bcf3.firebaseapp.com",
  projectId: "ideation-tool-8bcf3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const detailTableBody = document.querySelector("#detailTable tbody");
const summaryTableBody = document.querySelector("#scoreTable tbody");
const chipContainer = document.getElementById("chipFilter");

let allRatings = [];

function updateDetailTable(category) {
  detailTableBody.innerHTML = "";
  const filtered = category === "all" ? allRatings : allRatings.filter(r => r.category === category);
  filtered.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.topic}</td>
      <td>${row.category}</td>
      <td>${row.score}</td>
    `;
    detailTableBody.appendChild(tr);
  });
}

function updateSummaryTable() {
  summaryTableBody.innerHTML = "";
  const categoryGroups = {};
  allRatings.forEach(row => {
    if (!categoryGroups[row.category]) categoryGroups[row.category] = [];
    categoryGroups[row.category].push(Number(row.score));
  });

  Object.entries(categoryGroups).forEach(([category, scores]) => {
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${category}</td>
      <td>${avg}</td>
    `;
    summaryTableBody.appendChild(tr);
  });
}

chipContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("chip")) {
    document.querySelectorAll(".chip").forEach(chip => chip.classList.remove("active"));
    e.target.classList.add("active");
    const category = e.target.dataset.category;
    updateDetailTable(category);
  }
});

async function fetchRatings() {
  const querySnapshot = await getDocs(collection(db, "results"));
  querySnapshot.forEach(doc => {
    const data = doc.data();
    const name = data.username || "-";
    const topic = data.topic || "-";
    const results = data.results || {};

    Object.values(results).forEach(entry => {
      const rating = entry.rating || {};
      Object.entries(rating).forEach(([category, score]) => {
        if (!isNaN(score)) {
          allRatings.push({ name, topic, category, score });
        }
      });
    });
  });
  updateDetailTable("all");
  updateSummaryTable();
}

fetchRatings();
