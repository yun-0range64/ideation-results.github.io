// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_hiukwxN-ftyTQjhn7bwkvq0UntljUW4",
  authDomain: "ideation-tool-8bcf3.firebaseapp.com",
  projectId: "ideation-tool-8bcf3",
  storageBucket: "ideation-tool-8bcf3.firebasestorage.app",
  messagingSenderId: "962170855843",
  appId: "1:962170855843:web:8aebfea8944d8104aa3a16",
  measurementId: "G-4YWL4713T3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ add this to your firebase.js

export async function saveUsernameToDB(name, topic = "") {
  try {
    await addDoc(collection(db, "participants"), {
      username: name,
      topic: topic,
      timestamp: new Date().toISOString()
    });
    console.log("✅ 이름 저장 성공!");
  } catch (e) {
    console.error("🔥 이름 저장 실패:", e);
  }
}


// ✅ 외부에서 접근할 수 있게 export
export async function saveFullResultsToDB(username, topic, promptHistory, gptResponses, ratingHistory) {
  const results = {};

  for (let i = 1; i <= 6; i++) {
    const qKey = `Q${i}`;
    results[qKey] = {
      input: promptHistory[qKey] || "",
      gptResponse: gptResponses[qKey] || "",
      rating: ratingHistory[qKey]?.['별점 평가'] || {},
      기타_의견: ratingHistory[qKey]?.['기타 의견'] || ""
    };
  }

  try {
    await addDoc(collection(db, "results"), {
      username,
      topic,
      timestamp: new Date().toISOString(),
      results
    });
    console.log("✅ 전체 결과 Firestore에 저장 완료!");

    // ✅ 여기서 성공 후 alert + reload
    alert("실험에 참여해주셔서 감사합니다 :)");
    location.reload();

  } catch (e) {
    console.error("🔥 전체 결과 저장 실패:", e);
    alert("⚠️ 저장에 실패했어요. 다시 시도해주세요!");
  }
}