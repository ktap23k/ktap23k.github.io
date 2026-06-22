export const level20 = {
  id: 20,
  name: 'Cửa ngõ vô tận',
  subtitle: 'Đợt tấn công tổng lực',
  theme: {
    nebula: ['#2a0a0a', '#05050b'],
    starSpeed: 150,
  },
  spawnInterval: 0.4,
  difficultyMultiplier: 4.2,
  duration: 65,
  waves: [
    { delay: 0, count: 20, type: 'interceptor', pattern: 'vshape', interval: 0.12 },
    { delay: 5, count: 14, type: 'tank', pattern: 'line', interval: 0.3 },
    { delay: 14, count: 32, type: 'drone', pattern: 'random', interval: 0.08 },
    { delay: 24, count: 24, type: 'mixed', pattern: 'random', interval: 0.12 },
    { delay: 38, count: 20, type: 'tank', pattern: 'vshape', interval: 0.25 },
    { delay: 50, count: 30, type: 'interceptor', pattern: 'line', interval: 0.1 },
  ],
};
