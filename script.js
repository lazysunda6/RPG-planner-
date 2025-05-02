// Переменные
let tasks = [];
let xp = 0;
let level = 1;
const achievements = [
  "🏆 Новая надежда: выполни первую задачу!",
  "🎮 Прогрессор: +3 задачи за день!",
  "🕒 Соня: сделай задачу после обеда",
  "👑 Король продуктивности: все задачи закрыл!!"
];

// Загрузка данных из localStorage при старте
function loadData() {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  xp = parseInt(localStorage.getItem("xp")) || 0;
  level = parseInt(localStorage.getItem("level")) || 1;
  renderTasks();
  updateStats();
}

// Сохранение данных в localStorage
function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
}

// Добавление задачи
document.getElementById("addBtn").addEventListener("click", () => {
  const taskInput = document.getElementById("taskInput");
  if (!taskInput) {
    console.error("Element with id 'taskInput' not found");
    return;
  }
  const taskText = taskInput.value.trim();
  if (!taskText) return;
  tasks.push(taskText);
  renderTasks();
  taskInput.value = "";
  saveData();
});

// Поддержка Enter для добавления задачи
document.getElementById("taskInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("addBtn").click();
  }
});

// Рендеринг задач
function renderTasks() {
  const taskList = document.getElementById("taskList");
  if (!taskList) {
    console.error("Element with id 'taskList' not found");
    return;
  }
  taskList.innerHTML = tasks.map((task, index) =>
    `<li onclick="completeTask(${index})">${task}</li>`
  ).join("");
}

// Завершение задачи
function completeTask(index) {
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
}

// Обновление статистики
function updateStats() {
  const levelElement = document.getElementById("level");
  const xpBar = document.getElementById("xpBar");
  if (!levelElement || !xpBar) {
    console.error("Elements 'level' or 'xpBar' not found");
    return;
  }
  levelElement.textContent = level;
  xpBar.value = xp;
}

// Показ достижений с логикой
function showAchievement() {
  const achievementText = document.getElementById("achievementText");
  if (!achievementText) {
    console.error("Element with id 'achievementText' not found");
    return;
  }
  let achievement;
  if (tasks.length === 0 && level > 1) {
    achievement = achievements[3]; // "все задачи закрыл!!"
  } else if (level === 1 && xp === 0) {
    achievement = achievements[0]; // "выполни первую задачу!"
  } else {
    achievement = achievements[Math.floor(Math.random() * achievements.length)];
  }
  achievementText.textContent = `Достижение: ${achievement}`;
}

// Загрузка данных при старте страницы
window.onload = loadData;