export const level19 = {
  id: 19,
  name: 'Siêu bão vũ trụ',
  subtitle: 'Không có chỗ ẩn nấp',
  theme: {
    nebula: ['#15102a', '#05050b'],
    starSpeed: 140,
  },
  spawnInterval: 0.4,
  difficultyMultiplier: 4.0,
  duration: 60,
  waves: [
    { delay: 0, count: 28, type: 'drone', pattern: 'random', interval: 0.1 },
    { delay: 5, count: 16, type: 'interceptor', pattern: 'line', interval: 0.18 },
    { delay: 14, count: 14, type: 'tank', pattern: 'vshape', interval: 0.35 },
    { delay: 26, count: 30, type: 'mixed', pattern: 'random', interval: 0.1 },
    { delay: 40, count: 18, type: 'tank', pattern: 'random', interval: 0.28 },
  ],
};
