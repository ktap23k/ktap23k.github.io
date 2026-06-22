export const level03 = {
  id: 3,
  name: 'Trận địa phòng thủ',
  subtitle: 'Tank hạng nặng đang tới',
  theme: {
    nebula: ['#102018', '#05050b'],
    starSpeed: 65,
  },
  spawnInterval: 0.9,
  difficultyMultiplier: 1.5,
  duration: 50,
  waves: [
    { delay: 0.5, count: 3, type: 'tank', pattern: 'line', interval: 1.2 },
    { delay: 7.0, count: 6, type: 'interceptor', pattern: 'random', interval: 0.5 },
    { delay: 14.0, count: 5, type: 'tank', pattern: 'vshape', interval: 1.0 },
    { delay: 24.0, count: 12, type: 'mixed', pattern: 'random', interval: 0.35 },
    { delay: 36.0, count: 8, type: 'tank', pattern: 'line', interval: 0.8 },
  ],
};
