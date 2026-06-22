export const level16 = {
  id: 16,
  name: 'Vùng lõi quỹ đạo',
  subtitle: 'Phòng tuyến cuối cùng bắt đầu',
  theme: {
    nebula: ['#201020', '#05050b'],
    starSpeed: 120,
  },
  spawnInterval: 0.5,
  difficultyMultiplier: 3.4,
  duration: 58,
  waves: [
    { delay: 0, count: 12, type: 'tank', pattern: 'line', interval: 0.45 },
    { delay: 8, count: 18, type: 'interceptor', pattern: 'random', interval: 0.2 },
    { delay: 16, count: 20, type: 'mixed', pattern: 'random', interval: 0.18 },
    { delay: 28, count: 14, type: 'tank', pattern: 'vshape', interval: 0.4 },
    { delay: 40, count: 22, type: 'interceptor', pattern: 'line', interval: 0.15 },
  ],
};
