let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let xp = parseInt(localStorage.getItem("xp")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;

const achievements = [
  "🏆 Новая надежда: выполни первую задачу!",
  "🎮 Прогрессор: +3 задачи за день!",
  "🕒 Соня: сделай задачу после обеда",
  "👑 Король продуктивности: все задачи закрыл!!"
];

function loadData() {
  renderTasks();
  updateStats();
}

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
}

document.getElementById("addBtn").addEventListener("click", () => {
  const taskInput = document.getElementById("taskInput");
  if (!taskInput) return;
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  tasks.push({ text: taskText, done: false });  // Добавляем задачу с состоянием done = false
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
    `<li>
      <span class="task-text ${task.done ? 'task-complete' : ''}">${task.text}</span>
      <button onclick="editTask(${index})">Редактировать</button>
      <button onclick="deleteTask(${index})">Удалить</button>
      <button onclick="markAsDone(${index})">${task.done ? '✓ Сделано' : 'Сделать'}</button>
    </li>`
  ).join("");
}

function editTask(index) {
  const newText = prompt("Введите новый текст задачи:", tasks[index].text);
  if (newText && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    saveData();
    renderTasks();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1); // Удаляем задачу
  saveData();
  renderTasks();
}

function markAsDone(index) {
  tasks[index].done = !tasks[index].done; // Переключаем статус задачи
  saveData();
  renderTasks();
  updateStats();  // Если нужно обновить статистику после выполнения
}

function updateStats() {
  const levelElement = document.getElementById("level");
  const xpBar = document.getElementById("xpBar");
  if (!levelElement || !xpBar) return;

  levelElement.textContent = `Уровень: ${level}`;
  xpBar.value = xp;
}

function showAchievement() {
  const achievementText = document.getElementById("achievementText");
  if (!achievementText) return;

  let achievement;
  if (tasks.length === 0 && level > 1) achievement = achievements[3];
  else if (level === 1 && xp === 0) achievement = achievements[0];
  else achievement = achievements[Math.floor(Math.random() * achievements.length)];

  achievementText.textContent = `Достижение: ${achievement}`;
  achievementText.classList.add("achievement-unlock");
}

window.onload = loadData;