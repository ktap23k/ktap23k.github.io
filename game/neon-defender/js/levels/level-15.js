export const level15 = {
  id: 15,
  name: 'Cổng sao di động',
  subtitle: 'Kẻ địch xuất hiện liên tục',
  theme: {
    nebula: ['#1a1028', '#05050b'],
    starSpeed: 115,
  },
  spawnInterval: 0.5,
  difficultyMultiplier: 3.2,
  duration: 55,
  waves: [
    { delay: 0, count: 20, type: 'interceptor', pattern: 'random', interval: 0.18 },
    { delay: 6, count: 10, type: 'tank', pattern: 'line', interval: 0.5 },
    { delay: 15, count: 24, type: 'drone', pattern: 'random', interval: 0.15 },
    { delay: 25, count: 16, type: 'mixed', pattern: 'vshape', interval: 0.2 },
    { delay: 38, count: 12, type: 'tank', pattern: 'random', interval: 0.45 },
  ],
};
