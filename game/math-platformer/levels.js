/* =========================================
   MATH JUMP ADVENTURE — LEVELS
   =========================================
   Cấu trúc đã được mở rộng để dễ dàng thêm
   hàng trăm màn chơi:

   - QUESTION_BANK: kho câu hỏi đa dạng.
   - LAYOUT_TEMPLATES: các mẫu bố cục platform.
   - generateLevel(index): tự động sinh level.
   - LEVELS: mảng kết hợp level thủ công + procedural.

   Để thêm chủ đề mới: bổ sung câu hỏi vào
   QUESTION_BANK và cập nhật randomQuestion().
   ========================================= */

/* ---------- Helpers ---------- */
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Question Bank ---------- */
const QUESTION_BANK = {
  math: {
    addEasy: [
      { q: '3 + 4 = ?', a: '7' },
      { q: '6 + 2 = ?', a: '8' },
      { q: '5 + 5 = ?', a: '10' },
      { q: '2 + 7 = ?', a: '9' },
      { q: '4 + 6 = ?', a: '10' },
      { q: '8 + 1 = ?', a: '9' },
      { q: '3 + 6 = ?', a: '9' },
      { q: '7 + 3 = ?', a: '10' },
    ],
    addMedium: [
      { q: '12 + 15 = ?', a: '27' },
      { q: '24 + 19 = ?', a: '43' },
      { q: '38 + 26 = ?', a: '64' },
      { q: '45 + 37 = ?', a: '82' },
      { q: '56 + 48 = ?', a: '104' },
      { q: '67 + 89 = ?', a: '156' },
      { q: '123 + 79 = ?', a: '202' },
      { q: '245 + 188 = ?', a: '433' },
    ],
    subEasy: [
      { q: '7 - 3 = ?', a: '4' },
      { q: '9 - 4 = ?', a: '5' },
      { q: '8 - 2 = ?', a: '6' },
      { q: '10 - 5 = ?', a: '5' },
      { q: '6 - 1 = ?', a: '5' },
      { q: '5 - 3 = ?', a: '2' },
      { q: '9 - 7 = ?', a: '2' },
      { q: '4 - 0 = ?', a: '4' },
    ],
    subMedium: [
      { q: '42 - 17 = ?', a: '25' },
      { q: '63 - 28 = ?', a: '35' },
      { q: '100 - 36 = ?', a: '64' },
      { q: '85 - 49 = ?', a: '36' },
      { q: '150 - 78 = ?', a: '72' },
      { q: '200 - 95 = ?', a: '105' },
      { q: '333 - 177 = ?', a: '156' },
      { q: '500 - 234 = ?', a: '266' },
    ],
    mulEasy: [
      { q: '2 × 4 = ?', a: '8' },
      { q: '3 × 3 = ?', a: '9' },
      { q: '4 × 5 = ?', a: '20' },
      { q: '2 × 6 = ?', a: '12' },
      { q: '5 × 5 = ?', a: '25' },
      { q: '3 × 4 = ?', a: '12' },
      { q: '6 × 2 = ?', a: '12' },
      { q: '7 × 3 = ?', a: '21' },
    ],
    mulMedium: [
      { q: '6 × 7 = ?', a: '42' },
      { q: '8 × 9 = ?', a: '72' },
      { q: '12 × 8 = ?', a: '96' },
      { q: '11 × 11 = ?', a: '121' },
      { q: '13 × 7 = ?', a: '91' },
      { q: '15 × 6 = ?', a: '90' },
      { q: '14 × 5 = ?', a: '70' },
      { q: '9 × 12 = ?', a: '108' },
    ],
    divEasy: [
      { q: '8 ÷ 2 = ?', a: '4' },
      { q: '10 ÷ 5 = ?', a: '2' },
      { q: '12 ÷ 3 = ?', a: '4' },
      { q: '15 ÷ 5 = ?', a: '3' },
      { q: '18 ÷ 6 = ?', a: '3' },
      { q: '20 ÷ 4 = ?', a: '5' },
      { q: '24 ÷ 8 = ?', a: '3' },
      { q: '30 ÷ 6 = ?', a: '5' },
    ],
    divMedium: [
      { q: '56 ÷ 7 = ?', a: '8' },
      { q: '72 ÷ 9 = ?', a: '8' },
      { q: '84 ÷ 12 = ?', a: '7' },
      { q: '96 ÷ 8 = ?', a: '12' },
      { q: '108 ÷ 9 = ?', a: '12' },
      { q: '144 ÷ 12 = ?', a: '12' },
      { q: '169 ÷ 13 = ?', a: '13' },
      { q: '225 ÷ 15 = ?', a: '15' },
    ],
    mixed: [
      { q: '10 - 3 + 2 = ?', a: '9' },
      { q: '5 + 4 × 2 = ?', a: '13' },
      { q: '12 ÷ 3 + 5 = ?', a: '9' },
      { q: '20 - 4 × 3 = ?', a: '8' },
      { q: '18 ÷ 2 + 7 = ?', a: '16' },
      { q: '3 + 6 × 2 - 4 = ?', a: '11' },
      { q: '24 ÷ (3 + 1) = ?', a: '6' },
      { q: '(5 + 3) × 2 = ?', a: '16' },
    ],
    fraction: [
      { q: '½ + ½ = ?', a: '1' },
      { q: '¾ - ¼ = ?', a: '½' },
      { q: '2 × ½ = ?', a: '1' },
      { q: '1 ÷ ½ = ?', a: '2' },
      { q: '⅓ + ⅓ = ?', a: '⅔' },
      { q: '½ × ½ = ?', a: '¼' },
    ],
    square: [
      { q: '3² = ?', a: '9' },
      { q: '4² = ?', a: '16' },
      { q: '5² = ?', a: '25' },
      { q: '6² = ?', a: '36' },
      { q: '7² = ?', a: '49' },
      { q: '8² = ?', a: '64' },
      { q: '9² = ?', a: '81' },
      { q: '10² = ?', a: '100' },
    ],
    sqrt: [
      { q: '√16 = ?', a: '4' },
      { q: '√25 = ?', a: '5' },
      { q: '√36 = ?', a: '6' },
      { q: '√49 = ?', a: '7' },
      { q: '√64 = ?', a: '8' },
      { q: '√81 = ?', a: '9' },
      { q: '√100 = ?', a: '10' },
      { q: '√144 = ?', a: '12' },
    ],
    percent: [
      { q: '50% của 20 = ?', a: '10' },
      { q: '25% của 40 = ?', a: '10' },
      { q: '20% của 100 = ?', a: '20' },
      { q: '10% của 80 = ?', a: '8' },
      { q: '75% của 80 = ?', a: '60' },
      { q: '30% của 50 = ?', a: '15' },
    ],
    equation: [
      { q: 'x + 5 = 12, x = ?', a: '7' },
      { q: 'x - 3 = 8, x = ?', a: '11' },
      { q: '2x = 14, x = ?', a: '7' },
      { q: 'x ÷ 4 = 5, x = ?', a: '20' },
      { q: '3x + 2 = 11, x = ?', a: '3' },
      { q: '2x - 5 = 9, x = ?', a: '7' },
    ],
  },
  english: {
    vocabAnimals: [
      { q: '"Con mèo" tiếng Anh là?', a: 'cat' },
      { q: '"Con chó" tiếng Anh là?', a: 'dog' },
      { q: '"Con cá" tiếng Anh là?', a: 'fish' },
      { q: '"Con chim" tiếng Anh là?', a: 'bird' },
      { q: '"Con thỏ" tiếng Anh là?', a: 'rabbit' },
      { q: '"Con ngựa" tiếng Anh là?', a: 'horse' },
      { q: '"Con voi" tiếng Anh là?', a: 'elephant' },
      { q: '"Con sư tử" tiếng Anh là?', a: 'lion' },
    ],
    vocabColors: [
      { q: '"Màu đỏ" tiếng Anh là?', a: 'red' },
      { q: '"Màu xanh dương" tiếng Anh là?', a: 'blue' },
      { q: '"Màu xanh lá" tiếng Anh là?', a: 'green' },
      { q: '"Màu vàng" tiếng Anh là?', a: 'yellow' },
      { q: '"Màu đen" tiếng Anh là?', a: 'black' },
      { q: '"Màu trắng" tiếng Anh là?', a: 'white' },
      { q: '"Màu hồng" tiếng Anh là?', a: 'pink' },
      { q: '"Màu tím" tiếng Anh là?', a: 'purple' },
    ],
    vocabFood: [
      { q: '"Táo" tiếng Anh là?', a: 'apple' },
      { q: '"Chuối" tiếng Anh là?', a: 'banana' },
      { q: '"Bánh mì" tiếng Anh là?', a: 'bread' },
      { q: '"Sữa" tiếng Anh là?', a: 'milk' },
      { q: '"Trứng" tiếng Anh là?', a: 'egg' },
      { q: '"Cơm" tiếng Anh là?', a: 'rice' },
      { q: '"Nước" tiếng Anh là?', a: 'water' },
      { q: '"Cà phê" tiếng Anh là?', a: 'coffee' },
    ],
    numbers: [
      { q: '"Số 7" tiếng Anh là?', a: 'seven' },
      { q: '"Số 12" tiếng Anh là?', a: 'twelve' },
      { q: '"Số 15" tiếng Anh là?', a: 'fifteen' },
      { q: '"Số 20" tiếng Anh là?', a: 'twenty' },
      { q: '"Số 100" tiếng Anh là?', a: 'hundred' },
      { q: '"Số 1000" tiếng Anh là?', a: 'thousand' },
    ],
    days: [
      { q: '"Thứ Hai" tiếng Anh là?', a: 'Monday' },
      { q: '"Thứ Sáu" tiếng Anh là?', a: 'Friday' },
      { q: '"Chủ Nhật" tiếng Anh là?', a: 'Sunday' },
      { q: '"Tháng 1" tiếng Anh là?', a: 'January' },
      { q: '"Tháng 12" tiếng Anh là?', a: 'December' },
    ],
    prepositions: [
      { q: 'Giới từ chỉ vị trí "trên"?', a: 'on' },
      { q: 'Giới từ chỉ vị trí "dưới"?', a: 'under' },
      { q: 'Giới từ chỉ vị trí "trong"?', a: 'in' },
      { q: 'Giới từ chỉ vị trí "bên cạnh"?', a: 'next to' },
      { q: 'Giới từ chỉ vị trí "phía trước"?', a: 'in front of' },
      { q: 'Giới từ chỉ vị trí "phía sau"?', a: 'behind' },
    ],
    tenses: [
      { q: '"Eat" quá khứ đơn là?', a: 'ate' },
      { q: '"Go" quá khứ đơn là?', a: 'went' },
      { q: '"Have" quá khứ đơn là?', a: 'had' },
      { q: '"Do" quá khứ đơn là?', a: 'did' },
      { q: '"See" quá khứ đơn là?', a: 'saw' },
      { q: '"Take" quá khứ đơn là?', a: 'took' },
    ],
    antonyms: [
      { q: 'Trái nghĩa của "big"?', a: 'small' },
      { q: 'Trái nghĩa của "hot"?', a: 'cold' },
      { q: 'Trái nghĩa của "happy"?', a: 'sad' },
      { q: 'Trái nghĩa của "fast"?', a: 'slow' },
      { q: 'Trái nghĩa của "easy"?', a: 'difficult' },
      { q: 'Trái nghĩa của "young"?', a: 'old' },
    ],
  },
  science: {
    elements: [
      { q: 'Ký hiệu hóa học của Oxy?', a: 'O' },
      { q: 'Ký hiệu hóa học của Hydro?', a: 'H' },
      { q: 'Ký hiệu hóa học của Carbon?', a: 'C' },
      { q: 'Ký hiệu hóa học của Sắt?', a: 'Fe' },
      { q: 'Ký hiệu hóa học của Vàng?', a: 'Au' },
      { q: 'Ký hiệu hóa học của Bạc?', a: 'Ag' },
      { q: 'Ký hiệu hóa học của Nhôm?', a: 'Al' },
      { q: 'Ký hiệu hóa học của Canxi?', a: 'Ca' },
    ],
    biology: [
      { q: 'Bộ phận nào hô hấp ở người?', a: 'phổi' },
      { q: 'Bộ phận nào bơm máu?', a: 'tim' },
      { q: 'Cơ quan tiêu hóa chính?', a: 'dạ dày' },
      { q: 'Nơi trao đổi chất của tế bào?', a: 'ti thể' },
      { q: 'Vật chất di truyền chủ yếu?', a: 'ADN' },
      { q: 'Đơn vị cơ bản của sự sống?', a: 'tế bào' },
    ],
    physics: [
      { q: 'Đơn vị đo lực?', a: 'Newton' },
      { q: 'Đơn vị đo năng lượng?', a: 'Joule' },
      { q: 'Tốc độ ánh sáng xấp xỉ?', a: '300000km/s' },
      { q: 'Hành tinh thứ 3 từ Mặt Trời?', a: 'Trái Đất' },
      { q: 'Vệ tinh tự nhiên của Trái Đất?', a: 'Mặt Trăng' },
    ],
    chemistry: [
      { q: 'Công thức của nước?', a: 'H2O' },
      { q: 'Khí chiếm 78% khí quyển?', a: 'Nito' },
      { q: 'Khí cần cho sự cháy?', a: 'Oxy' },
      { q: 'Muối ăn là gì?', a: 'NaCl' },
      { q: 'Axit trong dạ dày?', a: 'HCl' },
    ],
  },
  geography: {
    vietnam: [
      { q: 'Thủ đô của Việt Nam?', a: 'Hà Nội' },
      { q: 'Thành phố lớn nhất Việt Nam?', a: 'TP.HCM' },
      { q: 'Dãy núi dài nhất Việt Nam?', a: 'Trường Sơn' },
      { q: 'Sông dài nhất Việt Nam?', a: 'Hồng' },
      { q: 'Đỉnh núi cao nhất Việt Nam?', a: 'Fansipan' },
      { q: 'Vịnh nổi tiếng ở Quảng Ninh?', a: 'Hạ Long' },
    ],
    world: [
      { q: 'Thủ đô của Nhật Bản?', a: 'Tokyo' },
      { q: 'Thủ đô của Pháp?', a: 'Paris' },
      { q: 'Thủ đô của Mỹ?', a: 'Washington' },
      { q: 'Thủ đô của Anh?', a: 'London' },
      { q: 'Đại dương lớn nhất?', a: 'Thái Bình Dương' },
      { q: 'Lục địa lớn nhất?', a: 'Á - Âu' },
      { q: 'Đất nước hình chiếc ủng?', a: 'Ý' },
      { q: 'Kim tự tháp ở đâu?', a: 'Ai Cập' },
    ],
  },
  history: {
    vietnam: [
      { q: 'Vua Hùng là tổ tiên của?', a: 'người Việt' },
      { q: 'Năm Bình Nguyên lỗi?', a: '1285' },
      { q: 'Chiến thắng Điện Biên Phủ năm?', a: '1954' },
      { q: 'Ngày giải phóng miền Nam?', a: '30/4/1975' },
      { q: 'Bác Hồ đọc Tuyên ngôn năm?', a: '1945' },
    ],
    world: [
      { q: 'Năm phát minh ra bánh xe?', a: '3500 TCN' },
      { q: 'Ai vẽ Mona Lisa?', a: 'Leonardo' },
      { q: 'Chiến tranh thế giới thứ 2 kết thúc năm?', a: '1945' },
      { q: 'Nước nào phát minh ra giấy?', a: 'Trung Quốc' },
    ],
  },
  logic: {
    riddles: [
      { q: 'Con gì càng to càng nhỏ?', a: 'số' },
      { q: 'Cái gì có cổ nhưng không có đầu?', a: 'chai' },
      { q: 'Cái gì đi nhanh khi đứng, đi chậm khi ngồi?', a: 'đồng hồ' },
      { q: 'Cái gì có 4 chân nhưng không đi?', a: 'bàn' },
      { q: 'Cái gì càng lau càng bẩn?', a: 'nước' },
      { q: 'Cái gì có mũi nhưng không thở?', a: 'kim' },
    ],
    sequences: [
      { q: '2, 4, 6, 8, ... số tiếp theo?', a: '10' },
      { q: '1, 1, 2, 3, 5, ... số tiếp theo?', a: '8' },
      { q: '3, 6, 12, 24, ... số tiếp theo?', a: '48' },
      { q: '1, 4, 9, 16, ... số tiếp theo?', a: '25' },
      { q: '2, 3, 5, 7, 11, ... số tiếp theo?', a: '13' },
    ],
  },
};

/* ---------- Distractor generators ---------- */
function numericDistractors(correct, count = 2) {
  const n = parseFloat(correct);
  const out = [];

  // Non-numeric answers (e.g. fractions written as ½) fall back to generic text distractors.
  if (Number.isNaN(n)) {
    const pool = shuffle(['A', 'B', 'C', 'D', 'X', 'Y', 'Z', '?', '!']);
    return pool.slice(0, count);
  }

  while (out.length < count) {
    const offset = randInt(1, Math.max(2, Math.floor(Math.abs(n) || 1) + 3));
    const sign = Math.random() > 0.5 ? 1 : -1;
    let v;
    if (Number.isInteger(n)) {
      v = n + offset * sign;
    } else {
      v = Number((n + offset * sign * 0.5).toFixed(1));
    }
    const s = String(v);
    if (s !== correct && !out.includes(s)) out.push(s);
  }
  return out;
}

function stringDistractors(correct, count = 2) {
  const pools = {
    cat: ['dog', 'fish', 'rat'],
    dog: ['cat', 'fox', 'wolf'],
    fish: ['cat', 'shark', 'whale'],
    bird: ['cat', 'dog', 'bat'],
    rabbit: ['cat', 'mouse', 'hamster'],
    horse: ['cow', 'donkey', 'zebra'],
    elephant: ['lion', 'tiger', 'bear'],
    lion: ['tiger', 'cat', 'leopard'],
    red: ['blue', 'green', 'yellow'],
    blue: ['red', 'green', 'black'],
    green: ['red', 'blue', 'yellow'],
    yellow: ['red', 'green', 'orange'],
    black: ['white', 'red', 'blue'],
    white: ['black', 'red', 'pink'],
    pink: ['red', 'purple', 'orange'],
    purple: ['pink', 'blue', 'green'],
    apple: ['banana', 'orange', 'grape'],
    banana: ['apple', 'mango', 'pineapple'],
    bread: ['cake', 'rice', 'noodle'],
    milk: ['water', 'juice', 'tea'],
    egg: ['milk', 'bread', 'cheese'],
    rice: ['bread', 'noodle', 'porridge'],
    water: ['milk', 'juice', 'tea'],
    coffee: ['tea', 'milk', 'cocoa'],
    seven: ['eight', 'six', 'nine'],
    twelve: ['eleven', 'thirteen', 'twenty'],
    fifteen: ['fourteen', 'sixteen', 'fifty'],
    twenty: ['twelve', 'thirty', 'two'],
    hundred: ['thousand', 'million', 'ten'],
    thousand: ['hundred', 'million', 'ten'],
    Monday: ['Tuesday', 'Sunday', 'Friday'],
    Friday: ['Monday', 'Thursday', 'Saturday'],
    Sunday: ['Saturday', 'Monday', 'Tuesday'],
    January: ['February', 'December', 'March'],
    December: ['November', 'January', 'October'],
    on: ['in', 'at', 'under'],
    under: ['on', 'in', 'behind'],
    in: ['on', 'at', 'under'],
    'next to': ['behind', 'in front of', 'between'],
    'in front of': ['behind', 'next to', 'under'],
    behind: ['in front of', 'next to', 'under'],
    ate: ['eaten', 'eated', 'eat'],
    went: ['gone', 'goed', 'going'],
    had: ['haved', 'has', 'have'],
    did: ['done', 'doed', 'does'],
    saw: ['seen', 'seed', 'see'],
    took: ['taken', 'taked', 'take'],
    big: ['small', 'little', 'tiny'],
    small: ['big', 'huge', 'large'],
    hot: ['cold', 'warm', 'cool'],
    cold: ['hot', 'warm', 'cool'],
    happy: ['sad', 'angry', 'tired'],
    sad: ['happy', 'angry', 'bored'],
    fast: ['slow', 'quick', 'rapid'],
    slow: ['fast', 'rapid', 'quick'],
    easy: ['difficult', 'hard', 'simple'],
    difficult: ['easy', 'hard', 'simple'],
    young: ['old', 'new', 'ancient'],
    old: ['young', 'new', 'ancient'],
  };
  const lower = correct.toLowerCase();
  if (pools[lower]) {
    const cands = shuffle(pools[lower]);
    return cands.slice(0, count);
  }
  return ['A', 'B'].slice(0, count);
}

function distractorsFor(correct, type = 'number') {
  if (type === 'number' || !isNaN(parseFloat(correct))) {
    return numericDistractors(correct, 2);
  }
  return stringDistractors(correct, 2);
}

/* ---------- Layout generators ---------- */
function buildPlatforms(difficulty) {
  const platforms = [];
  const movingPlatforms = [];
  const hazards = [];
  const answerXs = [];

  // Safe starting ground
  const groundW = 170;
  platforms.push({ x: 0, y: 560, w: groundW, h: 40 });
  // Death floor for the rest
  hazards.push({ x: groundW, y: 580, w: 1230, h: 20 });

  let x = groundW; // start right after the ground
  let y = 480;
  const steps = 7 + Math.min(8, difficulty);
  const yRange = { min: 160, max: 500 };

  // Step pattern with increasing gap
  for (let i = 0; i < steps; i++) {
    const gap = randInt(55, Math.min(115, 65 + difficulty * 5));
    const w = randInt(75, 160);
    // Limit vertical change so the jump is always possible (~120px max theoretical height)
    const dy = randInt(-70, 70);
    x += gap;
    y = Math.max(yRange.min, Math.min(yRange.max, y + dy));

    platforms.push({ x, y, w, h: 24 });

    // Candidate answer spot above this platform
    answerXs.push({ x: x + w / 2 - 17, y: y - 50 });

    x += w;

    // Chance for moving platform linking next gap
    if (difficulty > 2 && Math.random() < 0.28) {
      const mx = x + randInt(25, 55);
      const my = Math.max(160, Math.min(460, y + randInt(-60, 60)));
      movingPlatforms.push({
        x: mx, y: my, w: 90, h: 22,
        dx: rand(0.9, 2) * (Math.random() > 0.5 ? 1 : -1),
        range: randInt(55, 120),
        originX: mx
      });
    }

    // Spike patch on this platform occasionally
    if (difficulty > 1 && Math.random() < 0.22) {
      const sw = 30;
      const sx = Math.max(x - w + 10, x - randInt(25, Math.max(30, w - 35)));
      hazards.push({ x: sx, y: y - 20, w: sw, h: 20 });
    }
  }

  // Final reward platform reachable from the last generated platform
  const finalW = 170;
  const finalX = x + 70;
  const finalY = Math.max(yRange.min, y - randInt(35, 80));
  platforms.push({ x: finalX, y: finalY, w: finalW, h: 28 });
  answerXs.push({ x: finalX + finalW / 2 - 17, y: finalY - 50 });

  return { platforms, movingPlatforms, hazards, answerXs };
}

function makeAnswers(correct, positions) {
  const [d1, d2] = distractorsFor(correct);
  const values = shuffle([{ v: correct, c: true }, { v: d1, c: false }, { v: d2, c: false }]);
  return positions.slice(0, 3).map((p, i) => ({
    x: Math.round(p.x),
    y: Math.round(p.y),
    value: values[i].v,
    correct: values[i].c
  }));
}

/* ---------- Seeded random (deterministic runs) ---------- */
function makeSeededRandom(seed) {
  let s = seed >>> 0;
  if (s === 0) s = 12345;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function seededRand(rng, min, max) { return rng() * (max - min) + min; }
function seededRandInt(rng, min, max) { return Math.floor(seededRand(rng, min, max + 1)); }
function seededPick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function seededShuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Endless segment generator ---------- */
function generateSegment(startX, startY, difficulty, seed, addStartPad = true) {
  const rng = makeSeededRandom(seed);
  const platforms = [];
  const movingPlatforms = [];
  const hazards = [];
  const answerXs = [];

  let x = startX;
  let y = startY;
  const yRange = { min: 110, max: 520 };
  const steps = 6 + Math.min(10, Math.floor(difficulty / 2)) + seededRandInt(rng, 0, 3);

  // First platform: landing pad from previous segment
  if (addStartPad) {
    const startW = 140;
    platforms.push({ x: startX, y: startY, w: startW, h: 28 });
    x += startW;
  }

  for (let i = 0; i < steps; i++) {
    const gapMin = 55 + difficulty * 2;
    const gapMax = Math.min(160, 80 + difficulty * 10);
    const gap = seededRandInt(rng, gapMin, gapMax);
    const w = seededRandInt(rng, 60, 170);
    const dy = seededRandInt(rng, -90, 90);
    x += gap;
    y = Math.max(yRange.min, Math.min(yRange.max, y + dy));

    platforms.push({ x, y, w, h: 24 });
    answerXs.push({ x: x + w / 2 - 17, y: y - 85 });

    x += w;

    // Moving bridge platform across the gap
    if (rng() < 0.30 + difficulty * 0.04) {
      const mx = x - w - gap / 2 - 45;
      const my = Math.max(130, Math.min(480, y + seededRandInt(rng, -90, 90)));
      movingPlatforms.push({
        x: mx, y: my, w: 90, h: 22,
        dx: seededRand(rng, 0.9, 2.4) * (rng() > 0.5 ? 1 : -1),
        range: seededRandInt(rng, 60, 150),
        originX: mx
      });
    }

    // Spike patch on this platform
    if (difficulty > 0 && rng() < 0.22 + difficulty * 0.03) {
      const sw = seededRandInt(rng, 24, 48);
      const sx = seededRandInt(rng, x - w + 12, x - 12 - sw);
      hazards.push({ x: sx, y: y - 20, w: sw, h: 20 });
    }

    // Floor spikes below a gap
    if (rng() < 0.18) {
      const fw = seededRandInt(rng, 40, 90);
      const fx = x - gap / 2 - fw / 2;
      hazards.push({ x: fx, y: 585, w: fw, h: 15 });
    }
  }

  // End reward platform
  const finalW = 170;
  const finalX = x + seededRandInt(rng, 70, 130);
  const finalY = Math.max(yRange.min, y - seededRandInt(rng, 40, 110));
  platforms.push({ x: finalX, y: finalY, w: finalW, h: 28 });
  answerXs.push({ x: finalX + finalW / 2 - 17, y: finalY - 85 });

  return { platforms, movingPlatforms, hazards, answerXs, endX: finalX + finalW, endY: finalY };
}

function makeSegmentAnswers(rng, correct, answerXs) {
  const [d1, d2] = distractorsFor(correct);
  const positions = answerXs.slice(-3);
  // Correct answer is always at the last (final) position;
  // distractors are shuffled into the earlier two spots.
  const distractors = seededShuffle(rng, [d1, d2]);
  return positions.map((p, i) => ({
    x: Math.round(p.x),
    y: Math.round(p.y),
    value: i === positions.length - 1 ? correct : distractors[i],
    correct: i === positions.length - 1
  }));
}

/* ---------- Procedural level factory ---------- */
// Build a shuffled pool once for procedural levels
const ALL_QUESTIONS = (() => {
  const arr = [];
  Object.values(QUESTION_BANK).forEach(cat => {
    Object.values(cat).forEach(pool => arr.push(...pool));
  });
  return shuffle(arr);
})();

function generateLevel(index) {
  const difficulty = Math.min(12, 1 + Math.floor(index / 4));
  const layout = buildPlatforms(difficulty);

  // Cycle through the shuffled question pool
  const q = ALL_QUESTIONS[index % ALL_QUESTIONS.length];

  const level = {
    topic: pick(['Toán học', 'Tiếng Anh', 'Khoa học', 'Địa lý', 'Lịch sử', 'Logic']) + ` #${index + 1}`,
    question: q.q,
    correct: q.a,
    playerStart: { x: 60, y: 480 },
    platforms: layout.platforms,
    movingPlatforms: layout.movingPlatforms,
    hazards: layout.hazards,
    answers: makeAnswers(q.a, shuffle(layout.answerXs).slice(0, 3))
  };
  return level;
}

/* ---------- Hand-crafted special levels ---------- */
const HARDCODED_LEVELS = [
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
      { x: 120, y: 360, w: 100, h: 24, dx: 1.2, range: 140, originX: 120 }
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
      { x: 300, y: 260, w: 90, h: 22, dx: 1.5, range: 120, originX: 300 }
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
      { x: 500, y: 220, w: 80, h: 20, dx: 1.8, range: 100, originX: 500 },
      { x: 250, y: 300, w: 80, h: 20, dx: -1.4, range: 90, originX: 250 }
    ],
    answers: [
      { x: 250, y: 50, value: '9', correct: true },
      { x: 880, y: 150, value: '8', correct: false },
      { x: 480, y: 70, value: '7', correct: false }
    ]
  },
  {
    topic: 'Chia cơ bản',
    question: '12 ÷ 4 = ?',
    correct: '3',
    playerStart: { x: 40, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 200, h: 40 },
      { x: 260, y: 490, w: 100, h: 24 },
      { x: 420, y: 420, w: 100, h: 24 },
      { x: 580, y: 350, w: 100, h: 24 },
      { x: 740, y: 280, w: 120, h: 24 },
      { x: 560, y: 200, w: 100, h: 24 },
      { x: 340, y: 140, w: 140, h: 24 },
      { x: 80, y: 100, w: 120, h: 24 }
    ],
    hazards: [
      { x: 200, y: 580, w: 760, h: 20 },
      { x: 300, y: 240, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 200, y: 320, w: 90, h: 22, dx: 1.6, range: 110, originX: 200 }
    ],
    answers: [
      { x: 600, y: 150, value: '3', correct: true },
      { x: 120, y: 50, value: '4', correct: false },
      { x: 780, y: 230, value: '2', correct: false }
    ]
  },
  {
    topic: 'Màu sắc tiếng Anh',
    question: '"Màu xanh lá" tiếng Anh là?',
    correct: 'green',
    playerStart: { x: 40, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 180, h: 40 },
      { x: 220, y: 480, w: 90, h: 24 },
      { x: 360, y: 400, w: 90, h: 24 },
      { x: 500, y: 320, w: 90, h: 24 },
      { x: 640, y: 240, w: 90, h: 24 },
      { x: 780, y: 160, w: 180, h: 24 },
      { x: 540, y: 120, w: 140, h: 24 },
      { x: 280, y: 100, w: 140, h: 24 }
    ],
    hazards: [
      { x: 180, y: 580, w: 780, h: 20 }
    ],
    movingPlatforms: [
      { x: 420, y: 220, w: 80, h: 20, dx: 1.3, range: 100, originX: 420 }
    ],
    answers: [
      { x: 840, y: 110, value: 'green', correct: true },
      { x: 340, y: 50, value: 'blue', correct: false },
      { x: 600, y: 70, value: 'red', correct: false }
    ]
  },
  {
    topic: 'Bình phương',
    question: '4² = ?',
    correct: '16',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 160, h: 40 },
      { x: 200, y: 500, w: 80, h: 22 },
      { x: 320, y: 440, w: 80, h: 22 },
      { x: 440, y: 380, w: 80, h: 22 },
      { x: 560, y: 320, w: 80, h: 22 },
      { x: 680, y: 260, w: 80, h: 22 },
      { x: 800, y: 200, w: 160, h: 22 },
      { x: 620, y: 140, w: 120, h: 22 },
      { x: 380, y: 100, w: 160, h: 22 },
      { x: 120, y: 80, w: 140, h: 22 }
    ],
    hazards: [
      { x: 160, y: 580, w: 800, h: 20 },
      { x: 240, y: 260, w: 50, h: 20 }
    ],
    movingPlatforms: [
      { x: 280, y: 300, w: 80, h: 20, dx: -1.5, range: 90, originX: 280 },
      { x: 720, y: 340, w: 80, h: 20, dx: 1.7, range: 90, originX: 720 }
    ],
    answers: [
      { x: 440, y: 50, value: '16', correct: true },
      { x: 860, y: 150, value: '8', correct: false },
      { x: 170, y: 30, value: '20', correct: false }
    ]
  },
  {
    topic: 'Căn bậc hai',
    question: '√64 = ?',
    correct: '8',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 150, h: 40 },
      { x: 200, y: 490, w: 80, h: 22 },
      { x: 320, y: 420, w: 80, h: 22 },
      { x: 440, y: 350, w: 80, h: 22 },
      { x: 560, y: 280, w: 80, h: 22 },
      { x: 680, y: 210, w: 80, h: 22 },
      { x: 800, y: 140, w: 160, h: 22 },
      { x: 600, y: 100, w: 140, h: 22 },
      { x: 340, y: 80, w: 160, h: 22 }
    ],
    hazards: [
      { x: 150, y: 580, w: 810, h: 20 },
      { x: 360, y: 210, w: 40, h: 20 },
      { x: 640, y: 280, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 260, y: 300, w: 80, h: 20, dx: 1.4, range: 100, originX: 260 },
      { x: 500, y: 180, w: 80, h: 20, dx: -1.6, range: 100, originX: 500 }
    ],
    answers: [
      { x: 860, y: 90, value: '8', correct: true },
      { x: 400, y: 30, value: '6', correct: false },
      { x: 660, y: 50, value: '7', correct: false }
    ]
  },
  {
    topic: 'Phân số',
    question: '½ + ½ = ?',
    correct: '1',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 180, h: 40 },
      { x: 240, y: 480, w: 100, h: 24 },
      { x: 400, y: 400, w: 100, h: 24 },
      { x: 560, y: 320, w: 100, h: 24 },
      { x: 720, y: 240, w: 100, h: 24 },
      { x: 560, y: 160, w: 100, h: 24 },
      { x: 340, y: 120, w: 140, h: 24 },
      { x: 100, y: 80, w: 120, h: 24 },
      { x: 820, y: 120, w: 140, h: 24 }
    ],
    hazards: [
      { x: 180, y: 580, w: 780, h: 20 },
      { x: 450, y: 220, w: 50, h: 20 }
    ],
    movingPlatforms: [
      { x: 220, y: 300, w: 90, h: 22, dx: 1.4, range: 120, originX: 220 }
    ],
    answers: [
      { x: 380, y: 70, value: '1', correct: true },
      { x: 120, y: 30, value: '¼', correct: false },
      { x: 860, y: 70, value: '2', correct: false }
    ]
  },
];

/* Thêm 10 màn thủ công nâng cao */
HARDCODED_LEVELS.push(
  {
    topic: 'Số thứ tự tiếng Anh',
    question: '"Số 12" tiếng Anh là?',
    correct: 'twelve',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 170, h: 40 },
      { x: 220, y: 500, w: 80, h: 22 },
      { x: 340, y: 440, w: 80, h: 22 },
      { x: 460, y: 380, w: 80, h: 22 },
      { x: 580, y: 320, w: 80, h: 22 },
      { x: 700, y: 260, w: 80, h: 22 },
      { x: 820, y: 200, w: 160, h: 22 },
      { x: 640, y: 140, w: 120, h: 22 },
      { x: 400, y: 100, w: 160, h: 22 }
    ],
    hazards: [
      { x: 170, y: 580, w: 810, h: 20 },
      { x: 280, y: 280, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 300, y: 300, w: 80, h: 20, dx: 1.5, range: 110, originX: 300 }
    ],
    answers: [
      { x: 460, y: 50, value: 'twelve', correct: true },
      { x: 880, y: 150, value: 'twenty', correct: false },
      { x: 690, y: 90, value: 'eleven', correct: false }
    ]
  },
  {
    topic: 'Phép nhân nâng cao',
    question: '12 × 8 = ?',
    correct: '96',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 160, h: 40 },
      { x: 200, y: 500, w: 70, h: 22 },
      { x: 310, y: 450, w: 70, h: 22 },
      { x: 420, y: 400, w: 70, h: 22 },
      { x: 530, y: 350, w: 70, h: 22 },
      { x: 640, y: 300, w: 70, h: 22 },
      { x: 750, y: 250, w: 70, h: 22 },
      { x: 860, y: 200, w: 120, h: 22 },
      { x: 680, y: 140, w: 120, h: 22 },
      { x: 440, y: 100, w: 160, h: 22 }
    ],
    hazards: [
      { x: 160, y: 580, w: 800, h: 20 },
      { x: 250, y: 250, w: 40, h: 20 },
      { x: 580, y: 220, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 350, y: 300, w: 80, h: 20, dx: -1.6, range: 90, originX: 350 },
      { x: 760, y: 320, w: 80, h: 20, dx: 1.8, range: 90, originX: 760 }
    ],
    answers: [
      { x: 500, y: 50, value: '96', correct: true },
      { x: 900, y: 150, value: '86', correct: false },
      { x: 740, y: 90, value: '108', correct: false }
    ]
  },
  {
    topic: 'Nguyên tố hóa học',
    question: 'Ký hiệu của Vàng?',
    correct: 'Au',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 180, h: 40 },
      { x: 240, y: 490, w: 90, h: 24 },
      { x: 380, y: 420, w: 90, h: 24 },
      { x: 520, y: 350, w: 90, h: 24 },
      { x: 660, y: 280, w: 90, h: 24 },
      { x: 800, y: 210, w: 180, h: 24 },
      { x: 600, y: 150, w: 120, h: 24 },
      { x: 340, y: 110, w: 160, h: 24 }
    ],
    hazards: [
      { x: 180, y: 580, w: 780, h: 20 },
      { x: 430, y: 240, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 280, y: 320, w: 90, h: 22, dx: 1.4, range: 110, originX: 280 }
    ],
    answers: [
      { x: 400, y: 60, value: 'Au', correct: true },
      { x: 860, y: 160, value: 'Ag', correct: false },
      { x: 650, y: 100, value: 'Fe', correct: false }
    ]
  },
  {
    topic: 'Giới từ tiếng Anh',
    question: 'Giới từ "trên" trong tiếng Anh?',
    correct: 'on',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 170, h: 40 },
      { x: 210, y: 500, w: 80, h: 22 },
      { x: 330, y: 440, w: 80, h: 22 },
      { x: 450, y: 380, w: 80, h: 22 },
      { x: 570, y: 320, w: 80, h: 22 },
      { x: 690, y: 260, w: 80, h: 22 },
      { x: 810, y: 200, w: 170, h: 22 },
      { x: 620, y: 140, w: 120, h: 22 },
      { x: 360, y: 100, w: 160, h: 22 }
    ],
    hazards: [
      { x: 170, y: 580, w: 810, h: 20 },
      { x: 300, y: 280, w: 40, h: 20 },
      { x: 720, y: 340, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 250, y: 300, w: 80, h: 20, dx: 1.5, range: 100, originX: 250 },
      { x: 520, y: 200, w: 80, h: 20, dx: -1.7, range: 100, originX: 520 }
    ],
    answers: [
      { x: 420, y: 50, value: 'on', correct: true },
      { x: 870, y: 150, value: 'in', correct: false },
      { x: 670, y: 90, value: 'under', correct: false }
    ]
  },
  {
    topic: 'Phần trăm',
    question: '25% của 40 = ?',
    correct: '10',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 160, h: 40 },
      { x: 200, y: 500, w: 80, h: 22 },
      { x: 320, y: 440, w: 80, h: 22 },
      { x: 440, y: 380, w: 80, h: 22 },
      { x: 560, y: 320, w: 80, h: 22 },
      { x: 680, y: 260, w: 80, h: 22 },
      { x: 800, y: 200, w: 180, h: 22 },
      { x: 620, y: 140, w: 120, h: 22 },
      { x: 360, y: 100, w: 160, h: 22 }
    ],
    hazards: [
      { x: 160, y: 580, w: 800, h: 20 },
      { x: 260, y: 260, w: 40, h: 20 },
      { x: 640, y: 300, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 360, y: 300, w: 80, h: 20, dx: -1.4, range: 100, originX: 360 },
      { x: 720, y: 340, w: 80, h: 20, dx: 1.6, range: 100, originX: 720 }
    ],
    answers: [
      { x: 420, y: 50, value: '10', correct: true },
      { x: 860, y: 150, value: '20', correct: false },
      { x: 680, y: 90, value: '5', correct: false }
    ]
  },
  {
    topic: 'Giải phương trình',
    question: '2x + 5 = 15, x = ?',
    correct: '5',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 160, h: 40 },
      { x: 200, y: 490, w: 75, h: 22 },
      { x: 315, y: 430, w: 75, h: 22 },
      { x: 430, y: 370, w: 75, h: 22 },
      { x: 545, y: 310, w: 75, h: 22 },
      { x: 660, y: 250, w: 75, h: 22 },
      { x: 775, y: 190, w: 75, h: 22 },
      { x: 890, y: 130, w: 130, h: 22 },
      { x: 680, y: 100, w: 140, h: 22 },
      { x: 420, y: 80, w: 160, h: 22 }
    ],
    hazards: [
      { x: 160, y: 580, w: 800, h: 20 },
      { x: 360, y: 220, w: 40, h: 20 },
      { x: 600, y: 260, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 280, y: 320, w: 80, h: 20, dx: 1.6, range: 100, originX: 280 },
      { x: 750, y: 280, w: 80, h: 20, dx: -1.8, range: 100, originX: 750 }
    ],
    answers: [
      { x: 480, y: 30, value: '5', correct: true },
      { x: 940, y: 80, value: '10', correct: false },
      { x: 750, y: 50, value: '7', correct: false }
    ]
  },
  {
    topic: 'Địa lý Việt Nam',
    question: 'Thủ đô Việt Nam là?',
    correct: 'Hà Nội',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 180, h: 40 },
      { x: 240, y: 500, w: 90, h: 24 },
      { x: 380, y: 440, w: 90, h: 24 },
      { x: 520, y: 380, w: 90, h: 24 },
      { x: 660, y: 320, w: 90, h: 24 },
      { x: 800, y: 260, w: 180, h: 24 },
      { x: 600, y: 200, w: 120, h: 24 },
      { x: 360, y: 150, w: 140, h: 24 },
      { x: 100, y: 110, w: 120, h: 24 }
    ],
    hazards: [
      { x: 180, y: 580, w: 780, h: 20 },
      { x: 420, y: 260, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 260, y: 330, w: 90, h: 22, dx: 1.4, range: 120, originX: 260 }
    ],
    answers: [
      { x: 400, y: 100, value: 'Hà Nội', correct: true },
      { x: 120, y: 60, value: 'Huế', correct: false },
      { x: 860, y: 210, value: 'Đà Nẵng', correct: false }
    ]
  },
  {
    topic: 'Từ vựng đồ ăn',
    question: '"Bánh mì" tiếng Anh là?',
    correct: 'bread',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 170, h: 40 },
      { x: 220, y: 500, w: 80, h: 22 },
      { x: 340, y: 440, w: 80, h: 22 },
      { x: 460, y: 380, w: 80, h: 22 },
      { x: 580, y: 320, w: 80, h: 22 },
      { x: 700, y: 260, w: 80, h: 22 },
      { x: 820, y: 200, w: 170, h: 22 },
      { x: 640, y: 140, w: 120, h: 22 },
      { x: 380, y: 100, w: 160, h: 22 }
    ],
    hazards: [
      { x: 170, y: 580, w: 810, h: 20 },
      { x: 300, y: 280, w: 40, h: 20 },
      { x: 720, y: 340, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 260, y: 300, w: 80, h: 20, dx: 1.5, range: 100, originX: 260 },
      { x: 540, y: 200, w: 80, h: 20, dx: -1.6, range: 100, originX: 540 }
    ],
    answers: [
      { x: 440, y: 50, value: 'bread', correct: true },
      { x: 880, y: 150, value: 'rice', correct: false },
      { x: 700, y: 90, value: 'cake', correct: false }
    ]
  },
  {
    topic: 'Logic dãy số',
    question: '1, 1, 2, 3, 5, ... số tiếp theo?',
    correct: '8',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 160, h: 40 },
      { x: 200, y: 500, w: 80, h: 22 },
      { x: 320, y: 440, w: 80, h: 22 },
      { x: 440, y: 380, w: 80, h: 22 },
      { x: 560, y: 320, w: 80, h: 22 },
      { x: 680, y: 260, w: 80, h: 22 },
      { x: 800, y: 200, w: 180, h: 22 },
      { x: 620, y: 140, w: 120, h: 22 },
      { x: 360, y: 100, w: 160, h: 22 }
    ],
    hazards: [
      { x: 160, y: 580, w: 800, h: 20 },
      { x: 280, y: 260, w: 40, h: 20 },
      { x: 660, y: 300, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 340, y: 300, w: 80, h: 20, dx: -1.5, range: 100, originX: 340 },
      { x: 720, y: 340, w: 80, h: 20, dx: 1.7, range: 100, originX: 720 }
    ],
    answers: [
      { x: 420, y: 50, value: '8', correct: true },
      { x: 860, y: 150, value: '7', correct: false },
      { x: 680, y: 90, value: '6', correct: false }
    ]
  },
  {
    topic: 'Động từ bất quy tắc',
    question: '"Go" quá khứ đơn là?',
    correct: 'went',
    playerStart: { x: 30, y: 480 },
    platforms: [
      { x: 0, y: 560, w: 170, h: 40 },
      { x: 220, y: 500, w: 80, h: 22 },
      { x: 340, y: 440, w: 80, h: 22 },
      { x: 460, y: 380, w: 80, h: 22 },
      { x: 580, y: 320, w: 80, h: 22 },
      { x: 700, y: 260, w: 80, h: 22 },
      { x: 820, y: 200, w: 170, h: 22 },
      { x: 640, y: 140, w: 120, h: 22 },
      { x: 380, y: 100, w: 160, h: 22 }
    ],
    hazards: [
      { x: 170, y: 580, w: 810, h: 20 },
      { x: 320, y: 280, w: 40, h: 20 },
      { x: 720, y: 340, w: 40, h: 20 }
    ],
    movingPlatforms: [
      { x: 280, y: 300, w: 80, h: 20, dx: 1.6, range: 100, originX: 280 },
      { x: 560, y: 200, w: 80, h: 20, dx: -1.8, range: 100, originX: 560 }
    ],
    answers: [
      { x: 440, y: 50, value: 'went', correct: true },
      { x: 880, y: 150, value: 'goed', correct: false },
      { x: 700, y: 90, value: 'gone', correct: false }
    ]
  }
);

/* ---------- Compose final LEVELS array ---------- */
// Add question alternatives to hand-crafted levels so replays stay fresh.
HARDCODED_LEVELS[0].alternatives = QUESTION_BANK.math.addEasy;
HARDCODED_LEVELS[1].alternatives = QUESTION_BANK.math.subEasy;
HARDCODED_LEVELS[2].alternatives = QUESTION_BANK.english.vocabAnimals;
HARDCODED_LEVELS[3].alternatives = QUESTION_BANK.math.mulEasy;
HARDCODED_LEVELS[4].alternatives = QUESTION_BANK.math.mixed;
HARDCODED_LEVELS[5].alternatives = QUESTION_BANK.math.divEasy;
HARDCODED_LEVELS[6].alternatives = QUESTION_BANK.english.vocabColors;
HARDCODED_LEVELS[7].alternatives = QUESTION_BANK.math.square;
HARDCODED_LEVELS[8].alternatives = QUESTION_BANK.math.sqrt;
HARDCODED_LEVELS[9].alternatives = QUESTION_BANK.math.fraction;
HARDCODED_LEVELS[10].alternatives = QUESTION_BANK.english.numbers;
HARDCODED_LEVELS[11].alternatives = QUESTION_BANK.math.mulMedium;
HARDCODED_LEVELS[12].alternatives = QUESTION_BANK.science.elements;
HARDCODED_LEVELS[13].alternatives = QUESTION_BANK.english.prepositions;
HARDCODED_LEVELS[14].alternatives = QUESTION_BANK.math.percent;
HARDCODED_LEVELS[15].alternatives = QUESTION_BANK.math.equation;
HARDCODED_LEVELS[16].alternatives = QUESTION_BANK.geography.vietnam;
HARDCODED_LEVELS[17].alternatives = QUESTION_BANK.english.vocabFood;
HARDCODED_LEVELS[18].alternatives = QUESTION_BANK.logic.sequences;
HARDCODED_LEVELS[19].alternatives = QUESTION_BANK.english.tenses;

const PROCEDURAL_COUNT = 200;
const LEVELS = HARDCODED_LEVELS.slice();
for (let i = 0; i < PROCEDURAL_COUNT; i++) {
  LEVELS.push(generateLevel(HARDCODED_LEVELS.length + i));
}

/* ---------- Public API ---------- */
function getLevel(index) {
  index = Math.max(0, Math.min(LEVELS.length - 1, index));
  const base = JSON.parse(JSON.stringify(LEVELS[index]));

  // If the level has alternative questions, randomly swap one in.
  if (base.alternatives && base.alternatives.length > 1) {
    const alt = pick(base.alternatives);
    base.question = alt.q;
    base.correct = alt.a;
    base.answers = makeAnswers(alt.a, shuffle(base.answers.map(a => ({ x: a.x, y: a.y }))).slice(0, 3));
  }

  // Ensure moving platforms always carry an originX for the engine.
  if (base.movingPlatforms) {
    base.movingPlatforms.forEach(p => {
      if (p.originX === undefined) p.originX = p.x;
    });
  }

  // Raise answer items higher above platforms so players can pass
  // underneath them more easily without accidentally touching.
  if (base.answers) {
    base.answers.forEach(a => {
      a.y = Math.max(30, a.y - 30);
    });
  }

  return base;
}

function getTotalLevels() {
  return LEVELS.length;
}

function getSegmentQuestion(index) {
  return ALL_QUESTIONS[index % ALL_QUESTIONS.length];
}

// Expose for the game engine
if (typeof window !== 'undefined') {
  window.LEVELS = LEVELS;
  window.getLevel = getLevel;
  window.getTotalLevels = getTotalLevels;
  window.generateSegment = generateSegment;
  window.makeSegmentAnswers = makeSegmentAnswers;
  window.getSegmentQuestion = getSegmentQuestion;
}
