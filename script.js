import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_hiukwxN-ftyTQjhn7bwkvq0UntljUW4",
  authDomain: "ideation-tool-8bcf3.firebaseapp.com",
  projectId: "ideation-tool-8bcf3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tableBody = document.querySelector("#resultsTable tbody");
const detailModal = document.getElementById("detailModal");
const detailContent = document.getElementById("detailContent");
const closeModal = document.getElementById("closeModal");
closeModal.onclick = () => (detailModal.style.display = "none");

async function fetchResults() {
  const querySnapshot = await getDocs(collection(db, "results"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const tr = document.createElement("tr");

    const scores = Object.values(data.results || {}).map(q => {
      const ratings = q.rating || {};
      const ratingValues = Object.values(ratings)
        .filter(v => !isNaN(parseFloat(v)))
        .map(v => parseFloat(v));
      
      const sum = ratingValues.reduce((a, b) => a + b, 0);
      return ratingValues.length ? sum / ratingValues.length : null;
    });

    const validScores = scores.filter(s => s !== null);
    const avgScore = validScores.length
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
      : "-";

      tr.innerHTML = `
      <td>${data.username}</td>
      <td>${data.topic}</td>
      <td>${new Date(data.timestamp).toLocaleString()}</td>
      <td>${avgScore}</td>
      <td>
        <button class="view-btn" data-id="${doc.id}">보기</button>
        <button class="delete-btn" data-id="${doc.id}">삭제</button>
      </td>
    `;
    

    tr.querySelector("button").onclick = () => {
      const formattedHTML = formatDetailHTML(data);
      detailContent.innerHTML = formattedHTML;
      detailModal.style.display = "block";
    };
    
    tableBody.appendChild(tr);
  });
}
function formatDetailHTML(data) {
  const results = data.results || {};
  const questionTitles = {
    Q1: "생성하고자 하는 아이디어가 필요한 이유는 무엇인가요?",
    Q2: "해당 아이디어가 실현되었을 때 어떤 효과가 있을까요?",
    Q3: "이 아이디어의 최종 결과물은 어떤 형태로 제공되나요?",
    Q4: "이 아이디어를 구현하기 위해 필요한 핵심 기술은 무엇인가요?",
    Q5: "실현 과정에서 고려해야 할 제약 조건이 있다면 무엇인가요?",
    Q6: "비슷한 사례나 참고할 만한 예시가 있다면 알려주세요."
  };
  let html = `<h2>🧑‍💻 ${data.username} | 주제: ${data.topic}</h2>`;
  html += `<p><b>제출 시간:</b> ${new Date(data.timestamp).toLocaleString()}</p><hr/>`;

  Object.entries(results)
    .sort(([a], [b]) => parseInt(a.replace('Q', '')) - parseInt(b.replace('Q', '')))
    .forEach(([qKey, qData]) => {
      const title = questionTitles[qKey] || "";
      html += `<h3>📌 ${qKey}${title ? `. ${title}` : ""}</h3>`;
      html += `<p><b>입력:</b> ${qData.input || '-'}</p>`;
      html += `<p><b>GPT 응답:</b><br/><pre style="background:#f0f0f0; padding:10px; white-space:pre-wrap;">${qData.gptResponse || '-'}</pre></p>`;

      if (qData.rating) {
        html += `<p><b>⭐ 별점 평가:</b><ul>`;
        Object.entries(qData.rating).forEach(([category, score]) => {
          html += `<li>${category}: ${score}</li>`;
        });
        html += `</ul></p>`;
      }

      if (qData.기타_의견) {
        html += `<p><b>💬 기타 의견:</b> ${qData.기타_의견}</p>`;
      }

      html += `<hr/>`;
    });

  return html;
}

fetchResults();
tableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const confirmed = confirm("정말 이 데이터를 삭제하시겠습니까?");
    if (!confirmed) return;

    e.target.closest("tr").remove(); // ✅ 화면에서 행만 제거
    alert("화면에서 삭제되었습니다!");
  }
});


