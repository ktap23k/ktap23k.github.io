export const level23 = {
  id: 23,
  name: 'Điểm tận cùng',
  subtitle: 'Nhiệm vụ bất khả thi?',
  theme: {
    nebula: ['#000000', '#1a0505'],
    starSpeed: 180,
  },
  spawnInterval: 0.3,
  difficultyMultiplier: 5.2,
  duration: 75,
  waves: [
    { delay: 0, count: 36, type: 'mixed', pattern: 'random', interval: 0.06 },
    { delay: 5, count: 24, type: 'tank', pattern: 'line', interval: 0.15 },
    { delay: 14, count: 40, type: 'interceptor', pattern: 'vshape', interval: 0.06 },
    { delay: 26, count: 34, type: 'mixed', pattern: 'random', interval: 0.06 },
    { delay: 40, count: 28, type: 'tank', pattern: 'random', interval: 0.12 },
    { delay: 54, count: 42, type: 'interceptor', pattern: 'line', interval: 0.05 },
    { delay: 66, count: 30, type: 'mixed', pattern: 'random', interval: 0.06 },
  ],
};
