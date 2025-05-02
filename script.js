const game = (() => {
  const config = {
    xpPerTask: 15,
    baseXPRequired: 100,
    xpGrowthFactor: 1.15,
    bossDamageMin: 10,
    bossDamageMax: 20,
    bossXPReward: 100
  };

  const state = {
    tasks: [],
    xp: 0,
    level: 1,
    bossHp: 100,
    items: [
      { name: "Зелье опыта", xp: 25, used: false },
      { name: "Свиток силы", damageBonus: 5, used: false }
    ],
    achievements: [
      { id: 0, text: "🏆 Первый шаг: выполни задачу!", condition: s => s.tasks.some(t => t.done) },
      { id: 1, text: "⚔️ Воин: победи босса!", condition: s => s.bossHp <= 0 },
      { id: 2, text: "🧙 Маг: достиг 5 уровня", condition: s => s.level >= 5 }
    ],
    earnedAchievements: new Set()
  };

  function init() {
    loadData();
    bindEvents();
    renderAll();
  }

  function loadData() {
    const saved = safeParse(localStorage.getItem('gameState'));
    if (saved) {
      state.tasks = Array.isArray(saved.tasks) ? saved.tasks : state.tasks;
      state.xp = typeof saved.xp === 'number' ? saved.xp : state.xp;
      state.level = typeof saved.level === 'number' ? saved.level : state.level;
      state.bossHp = typeof saved.bossHp === 'number' ? saved.bossHp : state.bossHp;
      state.items = Array.isArray(saved.items) ? saved.items : state.items;
      state.earnedAchievements = new Set(saved.earnedAchievements || []);
    }
  }

  function saveData() {
    localStorage.setItem('gameState', JSON.stringify({
      tasks: state.tasks,
      xp: state.xp,
      level: state.level,
      bossHp: state.bossHp,
      items: state.items,
      earnedAchievements: Array.from(state.earnedAchievements)
    }));
  }

  function safeParse(json) {
    try {
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return alert('Введите текст квеста!');
    state.tasks.push({ text, done: false });
    input.value = '';
    input.focus();
    updateGame();
  }

  function toggleTask(index) {
    const task = state.tasks[index];
    task.done = !task.done;
    if (task.done) {
      state.xp += config.xpPerTask;
      checkLevelUp();
    }
    updateGame();
  }

  function checkLevelUp() {
    const required = getRequiredXP();
    while (state.xp >= required) {
      state.xp -= required;
      state.level++;
      checkAchievements();
    }
  }

  function getRequiredXP() {
    return Math.floor(config.baseXPRequired * Math.pow(config.xpGrowthFactor, state.level - 1));
  }

  function attackBoss() {
    if (state.bossHp <= 0) return alert('Босс уже побеждён!');
    let damage = config.bossDamageMin + Math.floor(Math.random() * (config.bossDamageMax - config.bossDamageMin + 1));
    const strengthScroll = state.items.find(item => item.name === "Свиток силы" && !item.used);
    if (strengthScroll) {
      damage += strengthScroll.damageBonus;
    }
    state.bossHp = Math.max(0, state.bossHp - damage);
    if (state.bossHp <= 0) {
      state.xp += config.bossXPReward;
      checkLevelUp();
      alert(`Босс повержен! Получено ${config.bossXPReward} XP!`);
    }
    updateGame();
  }

  function resetBoss() {
    state.bossHp = 100 + state.level * 10;
    document.querySelector('#attackBossBtn').disabled = false;
    updateGame();
  }

  function useItem(index) {
    const item = state.items[index];
    if (item.used) return;
    item.used = true;
    if (item.xp) state.xp += item.xp;
    checkLevelUp();
    updateGame();
  }

  function resetGame() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
      localStorage.removeItem('gameState');
      Object.assign(state, {
        tasks: [],
        xp: 0,
        level: 1,
        bossHp: 100,
        items: [
          { name: "Зелье опыта", xp: 25, used: false },
          { name: "Свиток силы", damageBonus: 5, used: false }
        ],
        earnedAchievements: new Set()
      });
      updateGame();
    }
  }

  function checkAchievements() {
    state.achievements.forEach(ach => {
      if (!state.earnedAchievements.has(ach.id)) {
        if (ach.condition(state)) {
          state.earnedAchievements.add(ach.id);
          showAchievement(ach.text);
        }
      }
    });
  }

  function renderAll() {
    renderTasks();
    renderStats();
    renderBoss();
    renderInventory();
    renderQuests();
  }

  function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = state.tasks.map((task, i) => `
      <li>
        <span class="${task.done ? 'task-complete' : ''}">${task.text}</span>
        <button class="taskBtn" data-index="${i}">${task.done ? '✓' : 'Сделать'}</button>
        <button class="deleteBtn" data-index="${i}">Удалить</button>
      </li>
    `).join('');
  }

  function renderStats() {
    document.getElementById('level').textContent = `Уровень: ${state.level}`;
    document.getElementById('xpBar').value = state.xp;
    document.getElementById('xpBar').max = getRequiredXP();
    document.getElementById('xpValue').textContent = state.xp;
    document.getElementById('requiredXP').textContent = getRequiredXP();
  }

  function renderBoss() {
    document.getElementById('bossHp').textContent = state.bossHp;
    document.getElementById('bossProgress').value = state.bossHp;
    document.getElementById('bossProgress').max = 100 + state.level * 10;
    document.querySelector('#attackBossBtn').disabled = state.bossHp <= 0;
    document.querySelector('#resetBossBtn').style.display = state.bossHp <= 0 ? 'block' : 'none';
  }

  function renderInventory() {
    const html = state.items.map((item, i) => `
      <div class="item" role="button" tabindex="0" onclick="game.useItem(${i})" ${item.used ? 'aria-disabled="true" style="opacity:0.5"' : ''}>
        ${item.name}${item.used ? ' (использован)' : ''}
      </div>
    `).join('') || 'пусто';
    document.getElementById('inventory').innerHTML = `<h2>Инвентарь</h2>${html}`;
  }

  function renderQuests() {
    const active = state.tasks.filter(t => !t.done);
    const html = active.length ?
      active.map(t => `<div>${t.text}</div>`).join('') : 'нет активных';
    document.getElementById('quests').innerHTML = `<h2>Квесты</h2>${html}`;
  }

  function showAchievement(text) {
    const el = document.getElementById('achievementText');
    el.textContent = `Достижение: ${text}`;
    el.classList.add('achievement-unlock');
    setTimeout(() => el.classList.remove('achievement-unlock'), 3000);
  }

  function bindEvents() {
    document.getElementById('addBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', e => {
      if (e.key === 'Enter') addTask();
    });
    document.querySelector('#attackBossBtn').addEventListener('click', attackBoss);
    document.querySelector('#resetBossBtn').addEventListener('click', resetBoss);
    document.querySelector('#resetGameBtn').addEventListener('click', resetGame);

    document.getElementById('taskList').addEventListener('click', e => {
      const index = e.target.dataset.index;
      if (e.target.classList.contains('taskBtn')) {
        toggleTask(index);
      } else if (e.target.classList.contains('deleteBtn')) {
        game.deleteTask(index);
      }
    });
  }

  function updateGame() {
    checkAchievements();
    renderAll();
    saveData();
  }

  return {
    init,
    addTask,
    toggleTask,
    deleteTask: index => {
      state.tasks.splice(index, 1);
      updateGame();
    },
    attackBoss,
    useItem,
    updateGame
  };
})();

window.onload = game.init;