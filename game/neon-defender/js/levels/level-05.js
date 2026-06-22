export const level05 = {
  id: 5,
  name: 'Vành đai băng giá',
  subtitle: 'Tốc độ kẻ địch tăng vọt',
  theme: {
    nebula: ['#0d1a2d', '#05050b'],
    starSpeed: 60,
  },
  spawnInterval: 0.95,
  difficultyMultiplier: 1.75,
  duration: 42,
  waves: [
    { delay: 0, count: 10, type: 'drone', pattern: 'vshape', interval: 0.4 },
    { delay: 6, count: 6, type: 'interceptor', pattern: 'line', interval: 0.6 },
    { delay: 14, count: 12, type: 'drone', pattern: 'random', interval: 0.35 },
    { delay: 24, count: 6, type: 'tank', pattern: 'random', interval: 0.9 },
  ],
};
