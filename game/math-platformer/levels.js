/* =========================================
   MATH JUMP ADVENTURE — LEVELS
   =========================================
   Để thêm màn mới: copy một object level, chỉnh sửa các thuộc tính.
   
   Cấu trúc level:
   {
     topic:    string   // chủ đề hiển thị
     question: string   // câu hỏi
     correct:  string   // đáp án đúng
     playerStart: {x, y}
     platforms: [{x, y, w, h}, ...]
     movingPlatforms: [{x, y, w, h, dx, range}, ...]
     hazards: [{x, y, w, h}, ...]
     answers: [{x, y, value, correct}, ...]
   }
   ========================================= */

const LEVELS = [
  {
    topic: 'Cộng cơ bản',
    question: '1 + 2 = ?',
    correct: '3',
    playerStart: { x: 60, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 320, h: 40 },
      { x: 400, y: 480, w: 200, h: 32 },
      { x: 680, y: 400, w: 280, h: 32 },
      { x: 520, y: 280, w: 160, h: 32 },
      { x: 200, y: 200, w: 240, h: 32 },
      { x: 0, y: 120, w: 160, h: 32 }
    ],
    hazards: [
      { x: 320, y: 580, w: 80, h: 20 },
      { x: 600, y: 580, w: 360, h: 20 }
    ],
    answers: [
      { x: 460, y: 420, value: '3', correct: true },
      { x: 760, y: 340, value: '4', correct: false },
      { x: 260, y: 140, value: '2', correct: false }
    ]
  },
  {
    topic: 'Trừ cơ bản',
    question: '5 - 2 = ?',
    correct: '3',
    playerStart: { x: 40, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 240, h: 40 },
      { x: 300, y: 500, w: 120, h: 28 },
      { x: 500, y: 430, w: 120, h: 28 },
      { x: 700, y: 360, w: 120, h: 28 },
      { x: 500, y: 260, w: 120, h: 28 },
      { x: 260, y: 180, w: 160, h: 28 },
      { x: 40, y: 100, w: 140, h: 28 }
    ],
    hazards: [
      { x: 240, y: 580, w: 720, h: 20 }
    ],
    movingPlatforms: [
      { x: 120, y: 360, w: 100, h: 24, dx: 1.2, range: 140 }
    ],
    answers: [
      { x: 540, y: 380, value: '3', correct: true },
      { x: 320, y: 130, value: '2', correct: false },
      { x: 80, y: 50, value: '4', correct: false }
    ]
  },
  {
    topic: 'Từ vựng tiếng Anh',
    question: '"Con mèo" tiếng Anh là?',
    correct: 'cat',
    playerStart: { x: 50, y: 500 },
    platforms: [
      { x: 0, y: 560, w: 200, h: 40 },
      { x: 240, y: 500, w: 100, h: 24 },
      { x: 400, y: 440, w: 100, h: 24 },
      { x: 560, y: 380, w: 100, h: 24 },
      { x: 720, y: 320, w: 100, h: 24 },
      { x: 560, y: 240, w: 100, h: 24 },
      { x: 360, y: 180, w: 140, h: 24 },
      { x: 120, y: 140, w: 120, h: 24 },
      { x: 800, y: 160, w: 160, h: 24 }
    ],
    hazards: [
      { x: 200, y: 580, w: 760, h: 20 }
    ],
    answers: [
      { x: 440, y: 390, value: 'cat', correct: true },
      { x: 180, y: 90, value: 'dog', correct: false },
      { x: 860, y: 110, value: 'fish', correct: false }
    ]
  },
  {
    topic: 'Nhân cơ bản',
    question: '2 × 3 = ?',
    correct: '6',
    playerStart: { x: 30, y: 500 },
    platforms: [
      { x: 0, y: 560, w: 180, h: 40 },
      { x: 220, y: 500, w: 90, h: 22 },
      { x: 360, y: 440, w: 90, h: 22 },
      { x: 500, y: 380, w: 90, h: 22 },
      { x: 640, y: 320, w: 90, h: 22 },
      { x: 780, y: 260, w: 180, h: 22 },
      { x: 600, y: 180, w: 120, h: 22 },
      { x: 400, y: 140, w: 120, h: 22 },
      { x: 180, y: 120, w: 120, h: 22 }
    ],
    hazards: [
      { x: 180, y: 580, w: 780, h: 20 },
      { x: 420, y: 300, w: 60, h: 20 }
    ],
    movingPlatforms: [
      { x: 300, y: 260, w: 90, h: 22, dx: 1.5, range: 120 }
    ],
    answers: [
      { x: 400, y: 90, value: '6', correct: true },
      { x: 840, y: 210, value: '5', correct: false },
      { x: 220, y: 70, value: '7', correct: false }
    ]
  },
  {
    topic: 'Tổng hợp',
    question: '10 - 3 + 2 = ?',
    correct: '9',
    playerStart: { x: 30, y: 500 },
    platforms: [
      { x: 0, y: 560, w: 150, h: 40 },
      { x: 190, y: 500, w: 80, h: 20 },
      { x: 320, y: 440, w: 80, h: 20 },
      { x: 450, y: 380, w: 80, h: 20 },
      { x: 580, y: 320, w: 80, h: 20 },
      { x: 710, y: 260, w: 80, h: 20 },
      { x: 840, y: 200, w: 120, h: 20 },
      { x: 650, y: 150, w: 120, h: 20 },
      { x: 420, y: 120, w: 160, h: 20 },
      { x: 180, y: 100, w: 160, h: 20 }
    ],
    hazards: [
      { x: 150, y: 580, w: 810, h: 20 },
      { x: 350, y: 250, w: 50, h: 20 },
      { x: 750, y: 350, w: 50, h: 20 }
    ],
    movingPlatforms: [
      { x: 500, y: 220, w: 80, h: 20, dx: 1.8, range: 100 },
      { x: 250, y: 300, w: 80, h: 20, dx: -1.4, range: 90 }
    ],
    answers: [
      { x: 250, y: 50, value: '9', correct: true },
      { x: 880, y: 150, value: '8', correct: false },
      { x: 480, y: 70, value: '7', correct: false }
    ]
  }
];
