export const level11 = {
  id: 11,
  name: 'Vùng cấm Alpha',
  subtitle: 'Drone tự sát dày đặc',
  theme: {
    nebula: ['#0d1f12', '#05050b'],
    starSpeed: 90,
  },
  spawnInterval: 0.65,
  difficultyMultiplier: 2.6,
  duration: 50,
  waves: [
    { delay: 0, count: 22, type: 'drone', pattern: 'random', interval: 0.18 },
    { delay: 7, count: 10, type: 'interceptor', pattern: 'random', interval: 0.35 },
    { delay: 16, count: 8, type: 'tank', pattern: 'vshape', interval: 0.7 },
    { delay: 26, count: 16, type: 'mixed', pattern: 'line', interval: 0.25 },
  ],
};
