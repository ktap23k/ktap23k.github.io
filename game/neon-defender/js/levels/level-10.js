export const level10 = {
  id: 10,
  name: 'Điểm nóng gamma',
  subtitle: 'Bước ngoặt của chiến dịch',
  theme: {
    nebula: ['#2a0a15', '#05050b'],
    starSpeed: 95,
  },
  spawnInterval: 0.7,
  difficultyMultiplier: 2.45,
  duration: 50,
  waves: [
    { delay: 0, count: 10, type: 'interceptor', pattern: 'line', interval: 0.35 },
    { delay: 6, count: 8, type: 'tank', pattern: 'random', interval: 0.7 },
    { delay: 15, count: 20, type: 'drone', pattern: 'vshape', interval: 0.2 },
    { delay: 26, count: 12, type: 'mixed', pattern: 'random', interval: 0.3 },
    { delay: 36, count: 10, type: 'tank', pattern: 'line', interval: 0.6 },
  ],
};
