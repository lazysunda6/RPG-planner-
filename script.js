let dailyQuests = JSON.parse(localStorage.getItem("dailyQuests")) || generateDailyQuests();
let completedTasks = parseInt(localStorage.getItem("completedTasks")) || 0;
let achievements = [];

function generateDailyQuests() {
  const questPool = [
    "Сделай 10 приседаний",
    "Почисти стол",
    "Выучи 5 английских слов",
    "Прочитай 1 страницу книги",
    "Сделай дыхательную паузу",
    "Пройди 1000 шагов",
    "Напиши список целей"
  ];
  let quests = [];
  while (quests.length < 3) {
    let quest = questPool[Math.floor(Math.random() * questPool.length)];
    if (!quests.includes(quest)) quests.push(quest);
  }
  const result = quests.map(text => ({ text, done: false }));
  localStorage.setItem("dailyQuests", JSON.stringify(result));
  localStorage.setItem("lastQuestDate", new Date().toDateString());
  return result;
}
let tasks = [];
let xp = 0;
let level = 1;
const achievementsList = [
  "🏆 Новая надежда: выполни первую задачу!",
  "🎮 Прогрессор: +3 задачи за день!",
  "🕒 Соня: сделай задачу после обеда",
  "👑 Король продуктивности: все задачи закрыл!!"
];

function loadData() {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  xp = parseInt(localStorage.getItem("xp")) || 0;
  level = parseInt(localStorage.getItem("level")) || 1;
  renderTasks();
  updateStats();
  renderDailyQuests();
}

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("dailyQuests", JSON.stringify(dailyQuests));
}

document.getElementById("addBtn").addEventListener("click", () => {
  const taskInput = document.getElementById("taskInput");
  if (!taskInput) return;
  const taskText = taskInput.value.trim();
  if (!taskText) return;
  tasks.push(taskText);
  renderTasks();
  taskInput.value = "";
  saveData();
});

document.getElementById("taskInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") document.getElementById("addBtn").click();
});

function renderTasks() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;
  taskList.innerHTML = tasks.map((task, index) =>
    `<li onclick="completeTask(${index})">${task}</li>`
  ).join("");
}

function completeTask(index) {
  const taskElement = document.getElementById("taskList").children[index];
  if (!taskElement) return;

  taskElement.classList.add("task-complete");

  taskElement.addEventListener("animationend", () => {
    tasks.splice(index, 1);
    xp += 20;
    if (xp >= 100) {
      level++;
      xp = 0;
      showAchievement();
    }
    updateStats();
    renderTasks();
    saveData();
  }, { once: true });
}

function updateStats() {
  const levelElement = document.getElementById("level");
  const xpBar = document.getElementById("xpBar");
  if (!levelElement || !xpBar) return;
  levelElement.textContent = level;
  xpBar.value = xp;
}

function showAchievement() {
  const achievementText = document.getElementById("achievementText");
  if (!achievementText) return;
  let achievement;
  if (tasks.length === 0 && level > 1) achievement = achievementsList[3];
  else if (level === 1 && xp === 0) achievement = achievementsList[0];
  else achievement = achievementsList[Math.floor(Math.random() * achievementsList.length)];
  achievementText.textContent = `Достижение: ${achievement}`;
  achievementText.classList.add("achievement-unlock");
}

// === Добавлены функции для ежедневных квестов ===

function renderDailyQuests() {
  const container = document.getElementById("dailyQuests");
  if (!container) return;
  container.innerHTML = "";
  dailyQuests.forEach((quest, index) => {
    const div = document.createElement("div");
    div.className = "task" + (quest.done ? " done" : "");
    div.innerHTML = `
      <span>${quest.text}</span>
      <button onclick="completeDailyQuest(${index})">${quest.done ? "✓" : "Выполнить"}</button>
    `;
    container.appendChild(div);
  });
}

function completeDailyQuest(index) {
  if (!dailyQuests[index].done) {
    dailyQuests[index].done = true;
    xp += 15;
    updateStats();
    renderDailyQuests();
    checkLevelUp();
    saveData();
  }
}

function checkLevelUp() {
  if (xp >= 100) {
    level++;
    xp = 0;
    showAchievement();
  }
}

// === Конец блока ежедневных квестов ===

window.onload = loadData;