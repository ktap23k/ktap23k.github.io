export const level22 = {
  id: 22,
  name: 'Vùng chết tuyệt đối',
  subtitle: 'Chỉ dành cho phi công xuất sắc',
  theme: {
    nebula: ['#1f0a1f', '#05050b'],
    starSpeed: 170,
  },
  spawnInterval: 0.35,
  difficultyMultiplier: 4.8,
  duration: 70,
  waves: [
    { delay: 0, count: 30, type: 'interceptor', pattern: 'random', interval: 0.08 },
    { delay: 5, count: 20, type: 'tank', pattern: 'line', interval: 0.2 },
    { delay: 14, count: 36, type: 'mixed', pattern: 'random', interval: 0.07 },
    { delay: 26, count: 24, type: 'tank', pattern: 'vshape', interval: 0.18 },
    { delay: 40, count: 32, type: 'interceptor', pattern: 'random', interval: 0.08 },
    { delay: 54, count: 20, type: 'tank', pattern: 'random', interval: 0.15 },
  ],
};
