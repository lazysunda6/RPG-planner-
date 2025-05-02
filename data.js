// data.js
export const gameData = {
  bosses: [
    {
      name: "Лень",
      maxHp: 100,
      xpReward: 100,
      description: "Могучий враг, питающийся вашим бездействием."
    },
    {
      name: "Хаос",
      maxHp: 150,
      xpReward: 150,
      description: "Существо, сеющее беспорядок в ваших планах."
    }
  ],
  items: [
    { name: "Зелье опыта", xp: 25, used: false },
    { name: "Свиток силы", damageBonus: 5, used: false },
    { name: "Кристалл фокуса", xp: 50, used: false }
  ],
  achievements: [
    {
      id: 0,
      text: "🏆 Первый шаг: выполни задачу!",
      condition: (state) => state.tasks.some((t) => t.done)
    },
    {
      id: 1,
      text: "⚔️ Воин: победи босса!",
      condition: (state) => state.bossHp <= 0
    },
    {
      id: 2,
      text: "🧙 Маг: достиг 5 уровня",
      condition: (state) => state.level >= 5
    },
    {
      id: 3,
      text: "👑 Герой: победи двух боссов!",
      condition: (state) => state.defeatedBosses.size >= 2
    }
  ]
};