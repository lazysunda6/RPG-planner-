(function () {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let xp = parseInt(localStorage.getItem("xp")) || 0;
  let level = parseInt(localStorage.getItem("level")) || 1;
  let saveTimeout;

  const achievements = [
    { id: 0, text: "🏆 Новая надежда: выполни первую задачу!", condition: () => tasks.length === 1 && tasks[0].done },
    { id: 1, text: "🎮 Прогрессор: +3 задачи за день!", condition: () => tasks.filter(t => t.done).length >= 3 },
    { id: 2, text: "🕒 Соня: сделай задачу после обеда", condition: () => new Date().getHours() >= 12 && tasks.some(t => t.done) },
    { id: 3, text: "👑 Король продуктивности: все задачи закрыл!!", condition: () => tasks.length > 0 && tasks.every(t => t.done) },
  ];

  function loadData() {
    try {
      tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      xp = parseInt(localStorage.getItem("xp")) || 0;
      level = parseInt(localStorage.getItem("level")) || 1;
      renderTasks();
      updateStats();
    } catch (e) {
      console.error("Ошибка загрузки данных:", e);
    }
  }

  function saveData() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("xp", xp);
        localStorage.setItem("level", level);
      } catch (e) {
        console.error("Ошибка сохранения данных:", e);
      }
    }, 500);
  }

  document.getElementById("addBtn").addEventListener("click", () => {
    const taskInput = document.getElementById("taskInput");
    if (!taskInput) return;
    const taskText = taskInput.value.trim();
    if (!taskText) {
      alert("Пожалуйста, введите задачу!");
      return;
    }

    tasks.push({ text: taskText, done: false });
    renderTasks();
    taskInput.value = "";
    saveData();
    checkAchievements();
  });

  document.getElementById("taskInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") document.getElementById("addBtn").click();
  });

  function renderTasks() {
    const taskList = document.getElementById("taskList");
    if (!taskList) return;

    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.className = `task-text ${task.done ? "task-complete" : ""}`;
      span.textContent = task.text;
      li.appendChild(span);

      const editBtn = document.createElement("button");
      editBtn.textContent = "Редактировать";
      editBtn.onclick = () => editTask(index);
      li.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Удалить";
      deleteBtn.onclick = () => deleteTask(index);
      li.appendChild(deleteBtn);

      const doneBtn = document.createElement("button");
      doneBtn.textContent = task.done ? "✓ Сделано" : "Сделать";
      doneBtn.onclick = () => markAsDone(index);
      li.appendChild(doneBtn);

      taskList.appendChild(li);
    });
  }

  function editTask(index) {
    const li = document.querySelector(`#taskList li:nth-child(${index + 1})`);
    const span = li.querySelector(".task-text");
    const input = document.createElement("input");
    input.type = "text";
    input.value = tasks[index].text;
    li.replaceChild(input, span);

    input.focus();
    input.addEventListener("blur", () => {
      const newText = input.value.trim();
      if (newText) {
        tasks[index].text = newText;
        saveData();
        renderTasks();
      } else {
        renderTasks();
      }
    });
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") input.blur();
    });
  }

  function deleteTask(index) {
    tasks.splice(index, 1);
    saveData();
    renderTasks();
    checkAchievements();
  }

  function markAsDone(index) {
    tasks[index].done = !tasks[index].done;
    if (tasks[index].done) {
      xp += 10;
      if (xp >= 100) {
        xp -= 100;
        level += 1;
      }
    }
    saveData();
    renderTasks();
    updateStats();
    checkAchievements();
  }

  function updateStats() {
    const levelElement = document.getElementById("level");
    const xpBar = document.getElementById("xpBar");
    const xpValue = document.getElementById("xpValue");
    if (!levelElement || !xpBar || !xpValue) return;

    levelElement.textContent = `Уровень: ${level}`;
    xpBar.value = xp;
    xpValue.textContent = xp;
  }

  function checkAchievements() {
    const achievementText = document.getElementById("achievementText");
    if (!achievementText) return;

    const earned = achievements.find(ach => ach.condition());
    if (earned) {
      achievementText.textContent = `Достижение: ${earned.text}`;
      achievementText.classList.add("achievement-unlock");
      setTimeout(() => {
        achievementText.classList.remove("achievement-unlock");
        achievementText.textContent = "";
      }, 3000);
    } else {
      achievementText.textContent = "";
    }
  }

  window.onload = loadData;
})();