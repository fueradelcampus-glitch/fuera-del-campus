
// =====================================
// FUERA DEL CAMPUS - JAVASCRIPT
// =====================================


// NAVIGATION

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");
const heading = document.getElementById("page-heading");

const pageNames = {
  home: "Dashboard",
  central: "Student Central",
  games: "Education Games",
  doubts: "Student Doubts",
  lost: "Lost & Found",
  future: "FutureMe",
  study: "StudyBuddy"
};

function openPage(pageName) {
  pages.forEach(page => {
    page.classList.toggle("active", page.id === pageName);
  });

  navButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  heading.textContent = pageNames[pageName] || "Dashboard";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    openPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    openPage(button.dataset.go);
  });
});


// STORAGE HELPERS

function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}


// =====================================
// STUDENT CENTRAL - TASK MANAGER
// =====================================

// Assignment entries are intentionally cleared on each fresh website update/session.
localStorage.removeItem("fueraTasks");
let tasks = [];

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

function renderTasks() {
  taskList.replaceChildren();

  tasks.forEach((task, index) => {
    const item = document.createElement("div");

    item.className = "task-item" +
      (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;
      saveData("fueraTasks", tasks);
      renderTasks();
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    item.append(checkbox, text);
    taskList.appendChild(item);
  });

  if (tasks.length === 0) {
    taskList.textContent =
      "No tasks yet. Add your first assignment!";
  }
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    text: text,
    done: false
  });

  saveData("fueraTasks", tasks);

  taskInput.value = "";
  renderTasks();
});

renderTasks();


// =====================================
// STUDENT CENTRAL - 8 PERIOD TIMETABLE
// =====================================
let timetable = loadData("fueraTimetable");
const timetableForm = document.getElementById("timetable-form");
const timetableList = document.getElementById("timetable-list");
const daySelect = document.getElementById("class-day");
const periodProgress = document.getElementById("period-progress");
const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function periodsFor(day) { return timetable.filter(x => x.day === day).length; }
function updatePeriodProgress() {
  const day = daySelect.value;
  const count = day ? periodsFor(day) : 0;
  if (!day) periodProgress.textContent = "Choose a day to start period 1 of 8.";
  else if (count >= 8) { periodProgress.textContent = `${day} is complete (8/8). Choose another day.`; daySelect.value = ""; }
  else periodProgress.textContent = `${day} · Period ${count + 1} of 8`;
}
daySelect.addEventListener("change", updatePeriodProgress);
function renderTimetable() {
  timetableList.replaceChildren();
  if (!timetable.length) { const p=document.createElement("p"); p.className="muted timetable-empty"; p.textContent="Your timetable is empty. Choose a day to add period 1."; timetableList.appendChild(p); return; }
  dayOrder.forEach(day => {
    const entries=timetable.filter(x=>x.day===day);
    if (!entries.length) return;
    const heading=document.createElement("h4"); heading.className="timetable-day-heading"; heading.textContent=`${day} · ${entries.length}/8 periods`; timetableList.appendChild(heading);
    entries.forEach((entry,index)=>{
      const item=document.createElement("div"); item.className="schedule-item";
      const details=document.createElement("div"); details.className="schedule-details";
      const title=document.createElement("strong"); title.textContent=`Period ${entry.period || index+1}: ${entry.subject}`;
      const meta=document.createElement("span"); meta.textContent=entry.room || "No room/teacher added"; details.append(title,meta);
      const remove=document.createElement("button"); remove.type="button"; remove.className="timetable-delete"; remove.textContent="Remove";
      remove.addEventListener("click",()=>{ timetable=timetable.filter(x=>x.id!==entry.id); // Re-number remaining periods in this day
        timetable.filter(x=>x.day===day).sort((a,b)=>(a.period||0)-(b.period||0)).forEach((x,i)=>x.period=i+1);
        saveData("fueraTimetable",timetable); renderTimetable(); updatePeriodProgress(); });
      item.append(details,remove); timetableList.appendChild(item);
    });
  });
}
timetableForm.addEventListener("submit",event=>{
  event.preventDefault(); const subject=document.getElementById("class-subject").value.trim(); const day=daySelect.value; const room=document.getElementById("class-room").value.trim();
  if(!subject||!day) return; const count=periodsFor(day); if(count>=8){updatePeriodProgress();return;}
  timetable.push({id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,subject,day,room,period:count+1}); saveData("fueraTimetable",timetable);
  document.getElementById("class-subject").value=""; document.getElementById("class-room").value="";
  if(count+1===8){ daySelect.value=""; periodProgress.textContent=`🎉 ${day} complete! All 8 periods saved. Choose another day to continue.`; }
  else updatePeriodProgress(); renderTimetable(); document.getElementById("class-subject").focus();
});
renderTimetable(); updatePeriodProgress();

// =====================================
// LOST & FOUND
// =====================================

let reports = loadData("fueraReports");

const lostForm = document.getElementById("lost-form");
const itemList = document.getElementById("item-list");
const itemSearch = document.getElementById("item-search");

function renderReports(search = "") {
  itemList.replaceChildren();

  const filtered = reports.filter(report =>
    [
      report.name,
      report.location,
      report.description,
      report.type
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    itemList.textContent = "No matching reports found.";
    return;
  }

  filtered.forEach(report => {
    const card = document.createElement("div");
    card.className = "report-card";

    const badge = document.createElement("span");
    badge.className = "report-type";
    badge.textContent = report.type.toUpperCase();

    const title = document.createElement("h4");
    title.textContent = report.name;

    const location = document.createElement("p");
    location.textContent = "Location: " + report.location;

    const description = document.createElement("p");
    description.textContent =
      report.description || "No description added.";

    card.append(badge, title, location, description);
    itemList.appendChild(card);
  });
}

lostForm.addEventListener("submit", event => {
  event.preventDefault();

  const report = {
    name: document.getElementById("item-name").value.trim(),
    type: document.getElementById("item-type").value,
    location: document.getElementById("item-location").value.trim(),
    description: document.getElementById("item-description").value.trim()
  };

  reports.unshift(report);

  saveData("fueraReports", reports);

  lostForm.reset();
  renderReports(itemSearch.value);

  alert("Your report has been added!");
});

itemSearch.addEventListener("input", () => {
  renderReports(itemSearch.value);
});

renderReports();


// =====================================
// FUTUREME - CAREER EXPLORER
// =====================================

const careerChoices = document.querySelectorAll(".choice");
const careerSubmit = document.getElementById("career-submit");
const careerResult = document.getElementById("career-result");

let selectedCareer = "";

const careerData = {
  technology: {
    title: "Technology Explorer 💻",
    careers: "Software Developer, AI Engineer, Cybersecurity Analyst",
    skills: "Programming, logical thinking and problem solving.",
    learn: "Explore HTML, JavaScript and Python."
  },

  creative: {
    title: "Creative Thinker 🎨",
    careers: "Graphic Designer, Animator, Architect, UI Designer",
    skills: "Creativity, visual communication and design.",
    learn: "Explore digital art, design and animation."
  },

  science: {
    title: "Science Explorer 🔬",
    careers: "Research Scientist, Biotechnologist, Physicist",
    skills: "Research, observation and experimentation.",
    learn: "Explore science projects and laboratory concepts."
  },

  business: {
    title: "Future Leader 📈",
    careers: "Entrepreneur, Business Analyst, Manager",
    skills: "Communication, planning and leadership.",
    learn: "Explore business basics and financial literacy."
  },

  helping: {
    title: "People Person 🤝",
    careers: "Doctor, Teacher, Psychologist, Social Worker",
    skills: "Empathy, communication and critical thinking.",
    learn: "Explore volunteering and community activities."
  },

  engineering: {
    title: "Future Engineer ⚙️",
    careers: "Mechanical Engineer, Civil Engineer, Robotics Engineer",
    skills: "Design, mathematics and practical problem solving.",
    learn: "Explore CAD, electronics and engineering projects."
  }
};

careerChoices.forEach(choice => {
  choice.addEventListener("click", () => {
    careerChoices.forEach(button => {
      button.classList.remove("selected");
    });

    choice.classList.add("selected");
    selectedCareer = choice.dataset.career;

    careerResult.classList.add("hidden");
  });
});

careerSubmit.addEventListener("click", () => {
  if (!selectedCareer) {
    alert("Please select an interest first!");
    return;
  }

  const result = careerData[selectedCareer];

  careerResult.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = result.title;

  const careers = document.createElement("p");
  careers.textContent = "Careers to explore: " + result.careers;

  const skills = document.createElement("p");
  skills.textContent = "Useful skills: " + result.skills;

  const learn = document.createElement("p");
  learn.textContent = "Getting started: " + result.learn;

  careerResult.append(title, careers, skills, learn);
  careerResult.classList.remove("hidden");
});


// =====================================
// STUDYBUDDY - FOCUS TIMER
// =====================================

let remainingTime = 25 * 60;
let timerInterval = null;

const timerDisplay = document.getElementById("timer");
const startTimer = document.getElementById("start-timer");
const resetTimer = document.getElementById("reset-timer");
const timerStatus = document.getElementById("timer-status");

function updateTimer() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  timerDisplay.textContent =
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
}

startTimer.addEventListener("click", () => {

  // Pause if already running
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;

    startTimer.textContent = "Resume";
    timerStatus.textContent = "Timer paused.";
    return;
  }

  // Don't restart a completed timer
  if (remainingTime <= 0) {
    timerStatus.textContent =
      "Session completed! Reset to start again.";
    return;
  }

  timerStatus.textContent = "Stay focused. You've got this!";
  startTimer.textContent = "Pause";

  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimer();

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;

      startTimer.textContent = "Start";
      timerStatus.textContent =
        "🎉 Great work! Study session complete.";
    }
  }, 1000);
});

resetTimer.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;

  remainingTime = 25 * 60;

  startTimer.textContent = "Start";
  timerStatus.textContent = "Ready when you are!";

  updateTimer();
});


// =====================================
// STUDYBUDDY - FLASHCARDS
// =====================================

let flashcards = loadData("fueraFlashcards");
let currentCard = 0;
let flipped = false;

const flashForm = document.getElementById("flash-form");
const flashArea = document.getElementById("flashcard-area");

function renderFlashcard() {
  flashArea.replaceChildren();

  if (flashcards.length === 0) {
    flashArea.textContent =
      "Your flashcards will appear here.";
    return;
  }

  const card = flashcards[currentCard];

  flashArea.textContent =
    flipped ? card.answer : card.question;
}

flashForm.addEventListener("submit", event => {
  event.preventDefault();

  const question = document
    .getElementById("flash-question").value.trim();

  const answer = document
    .getElementById("flash-answer").value.trim();

  if (!question || !answer) return;

  flashcards.push({
    question: question,
    answer: answer
  });

  saveData("fueraFlashcards", flashcards);

  currentCard = flashcards.length - 1;
  flipped = false;

  flashForm.reset();
  renderFlashcard();
});

document.getElementById("flip-card")
  .addEventListener("click", () => {

    if (flashcards.length === 0) return;

    flipped = !flipped;
    renderFlashcard();
  });

document.getElementById("next-card")
  .addEventListener("click", () => {

    if (flashcards.length === 0) return;

    currentCard = (currentCard + 1) % flashcards.length;
    flipped = false;

    renderFlashcard();
  });

document.getElementById("prev-card")
  .addEventListener("click", () => {

    if (flashcards.length === 0) return;

    currentCard =
      (currentCard - 1 + flashcards.length) %
      flashcards.length;

    flipped = false;
    renderFlashcard();
  });


// INITIALIZE

updateTimer();
renderFlashcard();


// Remove the intro layer after its pop-up and fade-out animation.
window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("brand-intro");
  if (!intro) return;
  window.setTimeout(() => intro.remove(), 3200);
});


// =====================================
// EDUCATION GAMES - non-repeating questions and bottom toast feedback
// =====================================
const toast = document.getElementById("game-toast");
let toastTimer;
function gameToast(message, correct) {
  toast.textContent = message;
  toast.className = `game-toast show ${correct ? "correct" : "wrong"}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
}
function takeRandom(pool, used) {
  const available = pool.map((_, i) => i).filter(i => !used.has(i));
  if (!available.length) { used.clear(); return takeRandom(pool, used); }
  const index = available[Math.floor(Math.random() * available.length)];
  used.add(index); return pool[index];
}
const usedMath = new Set(); let mathAnswer = 0;
function newMath() {
  const a=2+Math.floor(Math.random()*18), b=2+Math.floor(Math.random()*12), op=Math.random()<.5?"+":"×";
  mathAnswer=op==="+"?a+b:a*b; document.getElementById("math-question").textContent=`${a} ${op} ${b} = ?`;
  document.getElementById("math-answer").value="";
}
document.getElementById("math-new").addEventListener("click",newMath);
document.getElementById("math-form").addEventListener("submit",e=>{e.preventDefault();const val=Number(document.getElementById("math-answer").value);const ok=val===mathAnswer;gameToast(ok?"Correct! Great work 🎉":`Not quite — correct answer: ${mathAnswer}`,ok);newMath();});newMath();
const words=["science","planet","history","library","teacher","computer","biology","fraction","geometry","volcano","gravity","triangle","energy","ecosystem","chemical","literature","keyboard","language","equation","calendar"];
const usedWords=new Set();let currentWord="";
function newScramble(){currentWord=takeRandom(words,usedWords);let mixed=currentWord;while(mixed===currentWord)mixed=currentWord.split("").sort(()=>Math.random()-.5).join("");document.getElementById("scramble-word").textContent=mixed.toUpperCase();document.getElementById("scramble-answer").value="";}
document.getElementById("scramble-new").addEventListener("click",newScramble);
document.getElementById("scramble-form").addEventListener("submit",e=>{e.preventDefault();const ok=document.getElementById("scramble-answer").value.trim().toLowerCase()===currentWord;gameToast(ok?"Correct! ⭐":`Wrong — the word was ${currentWord.toUpperCase()}`,ok);newScramble();});newScramble();
const pairs=["📚","✏️","🔬","🌍","📚","✏️","🔬","🌍"];let memoryPick=[],memoryDone=[];
function renderMemory(){const board=document.getElementById("memory-board");board.replaceChildren();pairs.forEach((v,i)=>{const b=document.createElement("button");b.type="button";b.className="memory-card";b.textContent=memoryDone.includes(i)||memoryPick.includes(i)?v:"?";b.disabled=memoryDone.includes(i)||memoryPick.includes(i)||memoryPick.length===2;b.addEventListener("click",()=>{memoryPick.push(i);renderMemory();if(memoryPick.length===2){if(pairs[memoryPick[0]]===pairs[memoryPick[1]]){memoryDone.push(...memoryPick);memoryPick=[];gameToast("Match found!",true);renderMemory();if(memoryDone.length===pairs.length)gameToast("You matched every pair! 🏆",true);}else{gameToast("No match — try another pair.",false);setTimeout(()=>{memoryPick=[];renderMemory();},750);}}});board.appendChild(b);});}
document.getElementById("memory-reset").addEventListener("click",()=>{memoryPick=[];memoryDone=[];renderMemory();});renderMemory();
const quiz=[
{q:"Which planet is known as the Red Planet?",o:["Venus","Mars","Jupiter"],a:1},{q:"What is H₂O commonly called?",o:["Oxygen","Salt","Water"],a:2},{q:"How many sides does a hexagon have?",o:["5","6","8"],a:1},{q:"Which gas do plants absorb?",o:["Carbon dioxide","Helium","Hydrogen"],a:0},{q:"What is the largest ocean on Earth?",o:["Atlantic","Indian","Pacific"],a:2},{q:"Which organ pumps blood?",o:["Lungs","Heart","Brain"],a:1},{q:"How many continents are there?",o:["5","6","7"],a:2},{q:"Which is the closest star to Earth?",o:["Sirius","The Sun","Polaris"],a:1},{q:"What is the process of plants making food?",o:["Respiration","Photosynthesis","Digestion"],a:1},{q:"Which instrument measures temperature?",o:["Barometer","Thermometer","Compass"],a:1},{q:"What is the capital of Japan?",o:["Seoul","Tokyo","Beijing"],a:1},{q:"Which force pulls objects toward Earth?",o:["Friction","Magnetism","Gravity"],a:2}
];const usedQuiz=new Set();let currentQuiz;
function showQuiz(){currentQuiz=takeRandom(quiz,usedQuiz);document.getElementById("quiz-question").textContent=currentQuiz.q;const box=document.getElementById("quiz-options");box.replaceChildren();currentQuiz.o.forEach((v,i)=>{const b=document.createElement("button");b.type="button";b.className="secondary-btn";b.textContent=v;b.addEventListener("click",()=>{const ok=i===currentQuiz.a;gameToast(ok?"Correct answer! 🎉":`Wrong — correct answer: ${currentQuiz.o[currentQuiz.a]}`,ok);box.querySelectorAll("button").forEach(x=>x.disabled=true);setTimeout(showQuiz,1100);});box.appendChild(b);});}
document.getElementById("quiz-next").addEventListener("click",showQuiz);showQuiz();

// =====================================
// =====================================
// DEMO LOGIN / SIGN UP (LOCAL BROWSER)
// =====================================
const AUTH_USERS_KEY = "fueraCampusDemoUsers";
const AUTH_SESSION_KEY = "fueraCampusDemoSession";
const authScreen = document.getElementById("auth-screen");
const authForm = document.getElementById("auth-form");
const authName = document.getElementById("auth-name");
const authPassword = document.getElementById("auth-password");
const authMessage = document.getElementById("auth-message");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const authSubmit = document.getElementById("auth-submit");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const logoutButton = document.getElementById("logout-button");
let authMode = "login";
function getUsers() { try { return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || {}; } catch { return {}; } }
function setAuthMode(mode) {
  authMode = mode; const signup = mode === "signup";
  loginTab.classList.toggle("active", !signup); signupTab.classList.toggle("active", signup);
  authTitle.textContent = signup ? "Create your space." : "Welcome back.";
  authSubtitle.textContent = signup ? "Make an account and get started." : "Log in to continue your journey.";
  authSubmit.textContent = signup ? "Create account →" : "Log in →";
  authPassword.autocomplete = signup ? "new-password" : "current-password"; authMessage.textContent = "";
}
loginTab.addEventListener("click", () => setAuthMode("login"));
signupTab.addEventListener("click", () => setAuthMode("signup"));
function enterApp(name) {
  localStorage.setItem(AUTH_SESSION_KEY, name);
  document.getElementById("profile-name").textContent = name;
  document.querySelector(".avatar").textContent = name.charAt(0).toUpperCase();
  authScreen.classList.add("auth-hidden"); document.querySelector(".app").classList.add("app-ready");
}
authForm.addEventListener("submit", event => {
  event.preventDefault(); const name = authName.value.trim(); const password = authPassword.value;
  if (!name || !password) return;
  const users = getUsers(); const key = name.toLowerCase();
  if (authMode === "signup") {
    if (users[key]) { authMessage.textContent = "That name already has an account. Please log in."; setAuthMode("login"); return; }
    users[key] = { name, password }; localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users)); enterApp(name);
  } else {
    if (!users[key] || users[key].password !== password) { authMessage.textContent = "Name or password is incorrect. Try again or sign up."; return; }
    enterApp(users[key].name);
  }
});
logoutButton.addEventListener("click", () => {
  localStorage.removeItem(AUTH_SESSION_KEY); authScreen.classList.remove("auth-hidden");
  document.querySelector(".app").classList.remove("app-ready"); authPassword.value = ""; authName.value = ""; setAuthMode("login");
});
const savedSession = localStorage.getItem(AUTH_SESSION_KEY);
if (savedSession && getUsers()[savedSession.toLowerCase()]) enterApp(savedSession);
else authScreen.classList.remove("auth-hidden");

// =====================================
// STUDENT DOUBTS - GEMINI AI STUDY HELPER
// =====================================
const GEMINI_API_KEY = "AQ.Ab8RN6I2dc9FCmqNQYnjnLUCr4Bh5q-u2lIAVqCBZic-DSvkdQ";
const GEMINI_MODEL = "gemini-2.5-flash";
const doubtForm = document.getElementById("doubt-form");
const doubtInput = document.getElementById("doubt-input");
const doubtChat = document.getElementById("doubt-chat");
let doubtHistory = [];
function addChat(message, sender) {
  const bubble = document.createElement("div"); bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = message; doubtChat.appendChild(bubble); doubtChat.scrollTop = doubtChat.scrollHeight;
}
function removeAiLoading() { const loading = document.getElementById("gemini-loading"); if (loading) loading.remove(); }
async function askGemini(question) {
  if (GEMINI_API_KEY === "AQ.Ab8RN6I2dc9FCmqNQYnjnLUCr4Bh5q-u2lIAVqCBZic-DSvkdQ") { addChat("The chatbot is ready, but the organiser still needs to add the Gemini API key in script.js.", "assistant"); return; }
  const loading = document.createElement("div"); loading.id = "gemini-loading"; loading.className = "chat-bubble assistant"; loading.textContent = "Thinking…";
  doubtChat.appendChild(loading); doubtChat.scrollTop = doubtChat.scrollHeight;
  doubtHistory.push({ role: "user", parts: [{ text: question }] });
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are the friendly Student Doubts AI assistant for FUERA DEL CAMPUS, a school robotics fest. Explain robotics, coding, Arduino, electronics, sensors, circuits, maths and science in simple student-friendly steps. Be encouraging and concise. Never invent official event dates, rules, schedules or fees; direct students to organisers for unknown event information." }] },
        contents: doubtHistory, generationConfig: { temperature: 0.7, maxOutputTokens: 850 }
      })
    });
    const data = await response.json(); removeAiLoading();
    if (!response.ok) { doubtHistory.pop(); addChat(response.status === 429 ? "Gemini's free usage limit has been reached. Please try again later." : (data.error?.message || "Gemini could not answer. Please try again."), "assistant"); return; }
    const answer = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!answer) { doubtHistory.pop(); addChat("I couldn't create an answer. Please try asking another way.", "assistant"); return; }
    doubtHistory.push({ role: "model", parts: [{ text: answer }] }); addChat(answer, "assistant");
  } catch (error) { removeAiLoading(); doubtHistory.pop(); addChat("I can't connect to Gemini right now. Check your internet connection and try again.", "assistant"); console.error("Gemini error:", error); }
}
doubtForm.addEventListener("submit", event => { event.preventDefault(); const question = doubtInput.value.trim(); if (!question) return; addChat(question, "user"); doubtInput.value = ""; askGemini(question); });
