export const level14 = {
  id: 14,
  name: 'Hành tinh đổ nát',
  subtitle: 'Mảnh vỡ và đại quân đổ bộ',
  theme: {
    nebula: ['#2a1a0d', '#05050b'],
    starSpeed: 110,
  },
  spawnInterval: 0.55,
  difficultyMultiplier: 3.0,
  duration: 55,
  waves: [
    { delay: 0, count: 18, type: 'drone', pattern: 'random', interval: 0.2 },
    { delay: 6, count: 8, type: 'tank', pattern: 'random', interval: 0.6 },
    { delay: 14, count: 16, type: 'interceptor', pattern: 'vshape', interval: 0.25 },
    { delay: 24, count: 14, type: 'mixed', pattern: 'line', interval: 0.22 },
    { delay: 36, count: 10, type: 'tank', pattern: 'vshape', interval: 0.5 },
  ],
};
