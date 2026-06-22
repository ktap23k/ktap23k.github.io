export const level21 = {
  id: 21,
  name: 'Chiến trường tàn khốc',
  subtitle: 'Độ khó tăng vượt ngưỡng',
  theme: {
    nebula: ['#0a0a2a', '#05050b'],
    starSpeed: 160,
  },
  spawnInterval: 0.35,
  difficultyMultiplier: 4.5,
  duration: 65,
  waves: [
    { delay: 0, count: 26, type: 'mixed', pattern: 'random', interval: 0.1 },
    { delay: 6, count: 18, type: 'tank', pattern: 'random', interval: 0.25 },
    { delay: 16, count: 34, type: 'interceptor', pattern: 'vshape', interval: 0.08 },
    { delay: 28, count: 28, type: 'mixed', pattern: 'line', interval: 0.1 },
    { delay: 44, count: 22, type: 'tank', pattern: 'random', interval: 0.2 },
  ],
};
