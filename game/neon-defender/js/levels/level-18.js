export const level18 = {
  id: 18,
  name: 'Thành trì đa giác',
  subtitle: 'Tank bao vây từ mọi hướng',
  theme: {
    nebula: ['#1a0d0d', '#05050b'],
    starSpeed: 130,
  },
  spawnInterval: 0.45,
  difficultyMultiplier: 3.8,
  duration: 60,
  waves: [
    { delay: 0, count: 16, type: 'tank', pattern: 'random', interval: 0.35 },
    { delay: 8, count: 20, type: 'interceptor', pattern: 'random', interval: 0.18 },
    { delay: 18, count: 24, type: 'mixed', pattern: 'vshape', interval: 0.15 },
    { delay: 30, count: 12, type: 'tank', pattern: 'line', interval: 0.4 },
    { delay: 42, count: 20, type: 'interceptor', pattern: 'random', interval: 0.15 },
  ],
};
