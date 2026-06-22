export const level01 = {
  id: 1,
  name: 'Vùng ngoại vi',
  subtitle: 'Drone tuần tra đang tiếp cận',
  theme: {
    nebula: ['#0f0f20', '#05050b'],
    starSpeed: 35,
  },
  spawnInterval: 1.4,
  difficultyMultiplier: 1.0,
  duration: 35,
  waves: [
    { delay: 1.0, count: 4, type: 'drone', pattern: 'random', interval: 1.0 },
    { delay: 7.0, count: 6, type: 'drone', pattern: 'line', interval: 0.7 },
    { delay: 14.0, count: 8, type: 'drone', pattern: 'random', interval: 0.6 },
    { delay: 22.0, count: 10, type: 'drone', pattern: 'vshape', interval: 0.5 },
  ],
};
