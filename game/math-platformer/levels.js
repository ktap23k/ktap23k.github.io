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
      { q: '1 + 9 = ?', a: '10' },
      { q: '4 + 4 = ?', a: '8' },
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
      { q: '199 + 357 = ?', a: '556' },
      { q: '408 + 295 = ?', a: '703' },
    ],
    addHard: [
      { q: '789 + 456 = ?', a: '1245' },
      { q: '1024 + 976 = ?', a: '2000' },
      { q: '3456 + 2654 = ?', a: '6110' },
      { q: '999 + 1111 = ?', a: '2110' },
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
      { q: '10 - 2 = ?', a: '8' },
      { q: '8 - 5 = ?', a: '3' },
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
      { q: '1000 - 437 = ?', a: '563' },
      { q: '824 - 658 = ?', a: '166' },
    ],
    subHard: [
      { q: '2000 - 1234 = ?', a: '766' },
      { q: '5000 - 2789 = ?', a: '2211' },
      { q: '10000 - 4321 = ?', a: '5679' },
      { q: '8765 - 4321 = ?', a: '4444' },
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
      { q: '9 × 1 = ?', a: '9' },
      { q: '8 × 2 = ?', a: '16' },
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
      { q: '16 × 5 = ?', a: '80' },
      { q: '24 × 4 = ?', a: '96' },
    ],
    mulHard: [
      { q: '25 × 12 = ?', a: '300' },
      { q: '36 × 15 = ?', a: '540' },
      { q: '125 × 8 = ?', a: '1000' },
      { q: '45 × 22 = ?', a: '990' },
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
      { q: '36 ÷ 9 = ?', a: '4' },
      { q: '49 ÷ 7 = ?', a: '7' },
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
      { q: '256 ÷ 16 = ?', a: '16' },
      { q: '315 ÷ 15 = ?', a: '21' },
    ],
    divHard: [
      { q: '1000 ÷ 25 = ?', a: '40' },
      { q: '1440 ÷ 12 = ?', a: '120' },
      { q: '2025 ÷ 45 = ?', a: '45' },
      { q: '1728 ÷ 24 = ?', a: '72' },
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
      { q: '15 - 6 ÷ 2 = ?', a: '12' },
      { q: '(12 - 4) × 3 = ?', a: '24' },
    ],
    fraction: [
      { q: '½ + ½ = ?', a: '1' },
      { q: '¾ - ¼ = ?', a: '½' },
      { q: '2 × ½ = ?', a: '1' },
      { q: '1 ÷ ½ = ?', a: '2' },
      { q: '⅓ + ⅓ = ?', a: '⅔' },
      { q: '½ × ½ = ?', a: '¼' },
      { q: '¼ + ¼ = ?', a: '½' },
      { q: '⅔ - ⅓ = ?', a: '⅓' },
    ],
    decimal: [
      { q: '0,5 + 0,5 = ?', a: '1' },
      { q: '1,2 + 0,8 = ?', a: '2' },
      { q: '2,5 - 1,5 = ?', a: '1' },
      { q: '0,25 × 4 = ?', a: '1' },
      { q: '3,6 ÷ 0,6 = ?', a: '6' },
      { q: '1,5 × 2 = ?', a: '3' },
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
      { q: '11² = ?', a: '121' },
      { q: '12² = ?', a: '144' },
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
      { q: '√169 = ?', a: '13' },
      { q: '√196 = ?', a: '14' },
    ],
    cube: [
      { q: '2³ = ?', a: '8' },
      { q: '3³ = ?', a: '27' },
      { q: '4³ = ?', a: '64' },
      { q: '5³ = ?', a: '125' },
      { q: '10³ = ?', a: '1000' },
    ],
    percent: [
      { q: '50% của 20 = ?', a: '10' },
      { q: '25% của 40 = ?', a: '10' },
      { q: '20% của 100 = ?', a: '20' },
      { q: '10% của 80 = ?', a: '8' },
      { q: '75% của 80 = ?', a: '60' },
      { q: '30% của 50 = ?', a: '15' },
      { q: '15% của 200 = ?', a: '30' },
      { q: '5% của 100 = ?', a: '5' },
    ],
    equation: [
      { q: 'x + 5 = 12, x = ?', a: '7' },
      { q: 'x - 3 = 8, x = ?', a: '11' },
      { q: '2x = 14, x = ?', a: '7' },
      { q: 'x ÷ 4 = 5, x = ?', a: '20' },
      { q: '3x + 2 = 11, x = ?', a: '3' },
      { q: '2x - 5 = 9, x = ?', a: '7' },
      { q: '5x + 4 = 19, x = ?', a: '3' },
      { q: 'x ÷ 7 + 2 = 5, x = ?', a: '21' },
    ],
    ratio: [
      { q: 'Tỉ số 4 : 8 rút gọn = ?', a: '1:2' },
      { q: 'Tỉ số 15 : 25 rút gọn = ?', a: '3:5' },
      { q: '25% viết dưới dạng tỉ số = ?', a: '1:4' },
      { q: '50% viết dưới dạng tỉ số = ?', a: '1:2' },
    ],
    sequence: [
      { q: 'Số chẵn liền sau 18?', a: '20' },
      { q: 'Số lẻ liền trước 21?', a: '19' },
      { q: 'Bội chung nhỏ nhất của 3 và 4?', a: '12' },
      { q: 'Ước chung lớn nhất của 12 và 18?', a: '6' },
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
      { q: '"Con cá voi" tiếng Anh là?', a: 'whale' },
      { q: '"Con gấu" tiếng Anh là?', a: 'bear' },
      { q: '"Con cáo" tiếng Anh là?', a: 'fox' },
      { q: '"Con sóc" tiếng Anh là?', a: 'squirrel' },
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
      { q: '"Màu cam" tiếng Anh là?', a: 'orange' },
      { q: '"Màu nâu" tiếng Anh là?', a: 'brown' },
      { q: '"Màu xám" tiếng Anh là?', a: 'grey' },
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
      { q: '"Cam" tiếng Anh là?', a: 'orange' },
      { q: '"Thịt" tiếng Anh là?', a: 'meat' },
      { q: '"Cá" tiếng Anh là?', a: 'fish' },
      { q: '"Rau" tiếng Anh là?', a: 'vegetable' },
    ],
    vocabFamily: [
      { q: '"Mẹ" tiếng Anh là?', a: 'mother' },
      { q: '"Bố" tiếng Anh là?', a: 'father' },
      { q: '"Anh/chị/em trai" tiếng Anh là?', a: 'brother' },
      { q: '"Chị/em gái" tiếng Anh là?', a: 'sister' },
      { q: '"Ông" tiếng Anh là?', a: 'grandfather' },
      { q: '"Bà" tiếng Anh là?', a: 'grandmother' },
      { q: '"Bạn bè" tiếng Anh là?', a: 'friend' },
      { q: '"Gia đình" tiếng Anh là?', a: 'family' },
    ],
    vocabSchool: [
      { q: '"Bút chì" tiếng Anh là?', a: 'pencil' },
      { q: '"Sách" tiếng Anh là?', a: 'book' },
      { q: '"Thước kẻ" tiếng Anh là?', a: 'ruler' },
      { q: '"Bảng đen" tiếng Anh là?', a: 'board' },
      { q: '"Bàn" tiếng Anh là?', a: 'desk' },
      { q: '"Ghế" tiếng Anh là?', a: 'chair' },
      { q: '"Trường học" tiếng Anh là?', a: 'school' },
      { q: '"Giáo viên" tiếng Anh là?', a: 'teacher' },
      { q: '"Học sinh" tiếng Anh là?', a: 'student' },
    ],
    vocabWeather: [
      { q: '"Mưa" tiếng Anh là?', a: 'rain' },
      { q: '"Nắng" tiếng Anh là?', a: 'sun' },
      { q: '"Gió" tiếng Anh là?', a: 'wind' },
      { q: '"Tuyết" tiếng Anh là?', a: 'snow' },
      { q: '"Mây" tiếng Anh là?', a: 'cloud' },
      { q: '"Bão" tiếng Anh là?', a: 'storm' },
      { q: '"Nóng" tiếng Anh là?', a: 'hot' },
      { q: '"Lạnh" tiếng Anh là?', a: 'cold' },
    ],
    vocabBody: [
      { q: '"Đầu" tiếng Anh là?', a: 'head' },
      { q: '"Tay" tiếng Anh là?', a: 'hand' },
      { q: '"Chân" tiếng Anh là?', a: 'foot' },
      { q: '"Mắt" tiếng Anh là?', a: 'eye' },
      { q: '"Tai" tiếng Anh là?', a: 'ear' },
      { q: '"Mũi" tiếng Anh là?', a: 'nose' },
      { q: '"Miệng" tiếng Anh là?', a: 'mouth' },
      { q: '"Răng" tiếng Anh là?', a: 'tooth' },
    ],
    vocabJobs: [
      { q: '"Bác sĩ" tiếng Anh là?', a: 'doctor' },
      { q: '"Giáo viên" tiếng Anh là?', a: 'teacher' },
      { q: '"Cảnh sát" tiếng Anh là?', a: 'police' },
      { q: '"Lính cứu hỏa" tiếng Anh là?', a: 'firefighter' },
      { q: '"Đầu bếp" tiếng Anh là?', a: 'chef' },
      { q: '"Phi công" tiếng Anh là?', a: 'pilot' },
      { q: '"Kỹ sư" tiếng Anh là?', a: 'engineer' },
      { q: '"Nông dân" tiếng Anh là?', a: 'farmer' },
    ],
    vocabTransport: [
      { q: '"Xe đạp" tiếng Anh là?', a: 'bicycle' },
      { q: '"Ô tô" tiếng Anh là?', a: 'car' },
      { q: '"Xe buýt" tiếng Anh là?', a: 'bus' },
      { q: '"Máy bay" tiếng Anh là?', a: 'plane' },
      { q: '"Tàu hỏa" tiếng Anh là?', a: 'train' },
      { q: '"Tàu thủy" tiếng Anh là?', a: 'ship' },
      { q: '"Taxi" tiếng Anh là?', a: 'taxi' },
      { q: '"Xe máy" tiếng Anh là?', a: 'motorbike' },
    ],
    vocabHouse: [
      { q: '"Nhà" tiếng Anh là?', a: 'house' },
      { q: '"Cửa" tiếng Anh là?', a: 'door' },
      { q: '"Cửa sổ" tiếng Anh là?', a: 'window' },
      { q: '"Mái nhà" tiếng Anh là?', a: 'roof' },
      { q: '"Bếp" tiếng Anh là?', a: 'kitchen' },
      { q: '"Phòng ngủ" tiếng Anh là?', a: 'bedroom' },
      { q: '"Phòng tắm" tiếng Anh là?', a: 'bathroom' },
      { q: '"Vườn" tiếng Anh là?', a: 'garden' },
    ],
    numbers: [
      { q: '"Số 7" tiếng Anh là?', a: 'seven' },
      { q: '"Số 12" tiếng Anh là?', a: 'twelve' },
      { q: '"Số 15" tiếng Anh là?', a: 'fifteen' },
      { q: '"Số 20" tiếng Anh là?', a: 'twenty' },
      { q: '"Số 100" tiếng Anh là?', a: 'hundred' },
      { q: '"Số 1000" tiếng Anh là?', a: 'thousand' },
      { q: '"Số 0" tiếng Anh là?', a: 'zero' },
      { q: '"Số 30" tiếng Anh là?', a: 'thirty' },
      { q: '"Số 50" tiếng Anh là?', a: 'fifty' },
      { q: '"Số 80" tiếng Anh là?', a: 'eighty' },
    ],
    days: [
      { q: '"Thứ Hai" tiếng Anh là?', a: 'Monday' },
      { q: '"Thứ Ba" tiếng Anh là?', a: 'Tuesday' },
      { q: '"Thứ Tư" tiếng Anh là?', a: 'Wednesday' },
      { q: '"Thứ Năm" tiếng Anh là?', a: 'Thursday' },
      { q: '"Thứ Sáu" tiếng Anh là?', a: 'Friday' },
      { q: '"Thứ Bảy" tiếng Anh là?', a: 'Saturday' },
      { q: '"Chủ Nhật" tiếng Anh là?', a: 'Sunday' },
    ],
    months: [
      { q: '"Tháng 1" tiếng Anh là?', a: 'January' },
      { q: '"Tháng 2" tiếng Anh là?', a: 'February' },
      { q: '"Tháng 3" tiếng Anh là?', a: 'March' },
      { q: '"Tháng 4" tiếng Anh là?', a: 'April' },
      { q: '"Tháng 5" tiếng Anh là?', a: 'May' },
      { q: '"Tháng 6" tiếng Anh là?', a: 'June' },
      { q: '"Tháng 7" tiếng Anh là?', a: 'July' },
      { q: '"Tháng 12" tiếng Anh là?', a: 'December' },
    ],
    prepositions: [
      { q: 'Giới từ chỉ vị trí "trên"?', a: 'on' },
      { q: 'Giới từ chỉ vị trí "dưới"?', a: 'under' },
      { q: 'Giới từ chỉ vị trí "trong"?', a: 'in' },
      { q: 'Giới từ chỉ vị trí "bên cạnh"?', a: 'next to' },
      { q: 'Giới từ chỉ vị trí "phía trước"?', a: 'in front of' },
      { q: 'Giới từ chỉ vị trí "phía sau"?', a: 'behind' },
      { q: 'Giới từ chỉ vị trí "giữa"?', a: 'between' },
      { q: 'Giới từ chỉ vị trí "bên trên"?', a: 'above' },
    ],
    pronouns: [
      { q: '"Tôi" tiếng Anh là?', a: 'I' },
      { q: '"Bạn" tiếng Anh là?', a: 'you' },
      { q: '"Anh ấy" tiếng Anh là?', a: 'he' },
      { q: '"Cô ấy" tiếng Anh là?', a: 'she' },
      { q: '"Chúng tôi" tiếng Anh là?', a: 'we' },
      { q: '"Họ" tiếng Anh là?', a: 'they' },
      { q: '"Của tôi" tiếng Anh là?', a: 'my' },
      { q: '"Của anh ấy" tiếng Anh là?', a: 'his' },
    ],
    tenses: [
      { q: '"Eat" quá khứ đơn là?', a: 'ate' },
      { q: '"Go" quá khứ đơn là?', a: 'went' },
      { q: '"Have" quá khứ đơn là?', a: 'had' },
      { q: '"Do" quá khứ đơn là?', a: 'did' },
      { q: '"See" quá khứ đơn là?', a: 'saw' },
      { q: '"Take" quá khứ đơn là?', a: 'took' },
      { q: '"Run" quá khứ đơn là?', a: 'ran' },
      { q: '"Write" quá khứ đơn là?', a: 'wrote' },
      { q: '"Drink" quá khứ đơn là?', a: 'drank' },
      { q: '"Begin" quá khứ đơn là?', a: 'began' },
    ],
    antonyms: [
      { q: 'Trái nghĩa của "big"?', a: 'small' },
      { q: 'Trái nghĩa của "hot"?', a: 'cold' },
      { q: 'Trái nghĩa của "happy"?', a: 'sad' },
      { q: 'Trái nghĩa của "fast"?', a: 'slow' },
      { q: 'Trái nghĩa của "easy"?', a: 'difficult' },
      { q: 'Trái nghĩa của "young"?', a: 'old' },
      { q: 'Trái nghĩa của "tall"?', a: 'short' },
      { q: 'Trái nghĩa của "strong"?', a: 'weak' },
      { q: 'Trái nghĩa của "clean"?', a: 'dirty' },
      { q: 'Trái nghĩa của "day"?', a: 'night' },
    ],
    synonyms: [
      { q: 'Từ đồng nghĩa với "happy"?', a: 'glad' },
      { q: 'Từ đồng nghĩa với "sad"?', a: 'unhappy' },
      { q: 'Từ đồng nghĩa với "big"?', a: 'large' },
      { q: 'Từ đồng nghĩa với "small"?', a: 'little' },
      { q: 'Từ đồng nghĩa với "fast"?', a: 'quick' },
      { q: 'Từ đồng nghĩa với "begin"?', a: 'start' },
      { q: 'Từ đồng nghĩa với "end"?', a: 'finish' },
      { q: 'Từ đồng nghĩa với "beautiful"?', a: 'pretty' },
      { q: 'Từ đồng nghĩa với "angry"?', a: 'mad' },
      { q: 'Từ đồng nghĩa với "tired"?', a: 'sleepy' },
      { q: 'Từ đồng nghĩa với "smart"?', a: 'clever' },
      { q: 'Từ đồng nghĩa với "afraid"?', a: 'scared' },
    ],
    articles: [
      { q: 'Mạo từ xác định trong tiếng Anh?', a: 'the' },
      { q: 'Mạo từ "a" dùng trước danh từ bắt đầu bằng âm gì?', a: 'phụ âm' },
      { q: 'Mạo từ "an" dùng trước danh từ bắt đầu bằng âm gì?', a: 'nguyên âm' },
    ],
    plural: [
      { q: 'Số nhiều của "child"?', a: 'children' },
      { q: 'Số nhiều của "tooth"?', a: 'teeth' },
      { q: 'Số nhiều của "foot"?', a: 'feet' },
      { q: 'Số nhiều của "mouse"?', a: 'mice' },
      { q: 'Số nhiều của "sheep"?', a: 'sheep' },
      { q: 'Số nhiều của "fish"?', a: 'fish' },
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
      { q: 'Ký hiệu hóa học của Natri?', a: 'Na' },
      { q: 'Ký hiệu hóa học của Kali?', a: 'K' },
      { q: 'Ký hiệu hóa học của Lưu huỳnh?', a: 'S' },
      { q: 'Ký hiệu hóa học của Đồng?', a: 'Cu' },
    ],
    biology: [
      { q: 'Bộ phận nào hô hấp ở người?', a: 'phổi' },
      { q: 'Bộ phận nào bơm máu?', a: 'tim' },
      { q: 'Cơ quan tiêu hóa chính?', a: 'dạ dày' },
      { q: 'Nơi trao đổi chất của tế bào?', a: 'ti thể' },
      { q: 'Vật chất di truyền chủ yếu?', a: 'ADN' },
      { q: 'Đơn vị cơ bản của sự sống?', a: 'tế bào' },
      { q: 'Bộ phận lọc máu trong cơ thể?', a: 'thận' },
      { q: 'Cơ quan xử lý thông tin trong cơ thể?', a: 'não' },
      { q: 'Loài động vật có vú lớn nhất?', a: 'cá voi xanh' },
      { q: 'Cây xanh quang hợp nhờ sắc tố nào?', a: 'diệp lục' },
    ],
    physics: [
      { q: 'Đơn vị đo lực?', a: 'Newton' },
      { q: 'Đơn vị đo năng lượng?', a: 'Joule' },
      { q: 'Tốc độ ánh sáng xấp xỉ?', a: '300000km/s' },
      { q: 'Hành tinh thứ 3 từ Mặt Trờ?', a: 'Trái Đất' },
      { q: 'Vệ tinh tự nhiên của Trái Đất?', a: 'Mặt Trăng' },
      { q: 'Đơn vị đo cường độ dòng điện?', a: 'Ampe' },
      { q: 'Đơn vị đo hiệu điện thế?', a: 'Volt' },
      { q: 'Đơn vị đo điện trở?', a: 'Ohm' },
      { q: 'Lực hút Trái Đất tác dụng lên vật gọi là?', a: 'trọng lực' },
      { q: 'Vật chất truyền âm tốt nhất?', a: 'chất rắn' },
    ],
    chemistry: [
      { q: 'Công thức của nước?', a: 'H2O' },
      { q: 'Khí chiếm 78% khí quyển?', a: 'Nito' },
      { q: 'Khí cần cho sự cháy?', a: 'Oxy' },
      { q: 'Muối ăn là gì?', a: 'NaCl' },
      { q: 'Axit trong dạ dày?', a: 'HCl' },
      { q: 'Khí làm cháy nến trong không khí?', a: 'Oxy' },
      { q: 'Kim loại nhẹ nhất?', a: 'Liti' },
      { q: 'Kim loại dẫn điện tốt nhất?', a: 'Bạc' },
    ],
    astronomy: [
      { q: 'Hành tinh lớn nhất Hệ Mặt Trờ?', a: 'Sao Mộc' },
      { q: 'Hành tinh nhỏ nhất Hệ Mặt Trờ?', a: 'Sao Thủy' },
      { q: 'Hành tinh có vành đai đẹp nhất?', a: 'Sao Thổ' },
      { q: 'Ngôi sao gần Trái Đất nhất?', a: 'Mặt Trờ' },
      { q: 'Dải Ngân Hà là gì?', a: 'thiên hà' },
      { q: 'Chòm sao hình con gấu lớn?', a: 'Ursa Major' },
      { q: 'Sao chổi nổi tiếng đến gần Trái Đất 76 năm một lần?', a: 'Halley' },
    ],
    earth: [
      { q: 'Lớp bảo vệ Trái Đất khỏi bức xạ mặt trời?', a: 'tầng ôzôn' },
      { q: 'Vỏ Trái Đất chia thành mấn lớp kiến tạo chính?', a: '7' },
      { q: 'Hiện tượng đất rung chuyển gọi là?', a: 'động đất' },
      { q: 'Núi lửa phun ra chất gì nóng nhất?', a: 'magma' },
      { q: 'Đại dương lớn nhất?', a: 'Thái Bình Dương' },
      { q: 'Đại dương nhỏ nhất?', a: 'Bắc Băng Dương' },
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
      { q: 'Cố đô của Việt Nam?', a: 'Huế' },
      { q: 'Thành phố biển nổi tiếng ở Khánh Hòa?', a: 'Nha Trang' },
      { q: 'Đảo lớn nhất Việt Nam?', a: 'Phú Quốc' },
      { q: 'Cửa khẩu quốc tế cao nhất Việt Nam?', a: 'Lào Cai' },
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
      { q: 'Thủ đô của Hàn Quốc?', a: 'Seoul' },
      { q: 'Thủ đô của Ấn Độ?', a: 'New Delhi' },
      { q: 'Thủ đô của Brazil?', a: 'Brasília' },
      { q: 'Thủ đô của Nga?', a: 'Moscow' },
    ],
    capitals: [
      { q: 'Thủ đô của Úc?', a: 'Canberra' },
      { q: 'Thủ đô của Canada?', a: 'Ottawa' },
      { q: 'Thủ đô của Đức?', a: 'Berlin' },
      { q: 'Thủ đô của Ý?', a: 'Rome' },
      { q: 'Thủ đô của Tây Ban Nha?', a: 'Madrid' },
      { q: 'Thủ đô của Trung Quốc?', a: 'Bắc Kinh' },
      { q: 'Thủ đô của Thái Lan?', a: 'Bangkok' },
      { q: 'Thủ đô của Singapore?', a: 'Singapore' },
    ],
    rivers: [
      { q: 'Sông dài nhất thế giới?', a: 'Nile' },
      { q: 'Sông dài nhất Nam Mỹ?', a: 'Amazon' },
      { q: 'Sông dài nhất châu Á?', a: 'Dương Tử' },
      { q: 'Sông dài nhất châu Âu?', a: 'Volga' },
    ],
    mountains: [
      { q: 'Đỉnh núi cao nhất thế giới?', a: 'Everest' },
      { q: 'Dãy núi dài nhất thế giới?', a: 'Andes' },
      { q: 'Núi cao nhất châu Phi?', a: 'Kilimanjaro' },
      { q: 'Núi cao nhất Nhật Bản?', a: 'Phú Sĩ' },
    ],
  },
  history: {
    vietnam: [
      { q: 'Vua Hùng là tổ tiên của?', a: 'người Việt' },
      { q: 'Năm quân Nguyên lần thứ hai xâm lược Đại Việt?', a: '1285' },
      { q: 'Chiến thắng Điện Biên Phủ năm?', a: '1954' },
      { q: 'Ngày giải phóng miền Nam?', a: '30/4/1975' },
      { q: 'Bác Hồ đọc Tuyên ngôn năm?', a: '1945' },
      { q: 'Chiến thắng Bạch Đằng lịch sử do vua nào lãnh đạo?', a: 'Ngô Quyền' },
      { q: 'Vị tướng đánh tan quân Nam Hán?', a: 'Ngô Quyền' },
      { q: 'Nữ tướng nổi dậy chống quân Đông Hán?', a: 'Bà Triệu' },
      { q: 'Vị vua khai quốc nhà Lý?', a: 'Lý Thái Tổ' },
      { q: 'Kinh thành Thăng Long được xây dựng năm?', a: '1010' },
    ],
    world: [
      { q: 'Năm phát minh ra bánh xe?', a: '3500 TCN' },
      { q: 'Chiến tranh thế giới thứ 2 kết thúc năm?', a: '1945' },
      { q: 'Nước nào phát minh ra giấy?', a: 'Trung Quốc' },
      { q: 'Nước nào phát minh ra la bàn?', a: 'Trung Quốc' },
      { q: 'Năm Columbus đến châu Mỹ?', a: '1492' },
      { q: 'Bức tường Berlin sụp đổ năm?', a: '1989' },
      { q: 'Liên Xô tan rã năm?', a: '1991' },
      { q: 'Hiến chương Liên Hợp Quốc được ký năm?', a: '1945' },
      { q: 'Cách mạng Pháp bắt đầu năm?', a: '1789' },
      { q: 'Năm Mỹ tuyên bố độc lập?', a: '1776' },
    ],
    inventors: [
      { q: 'Ai phát minh ra bóng đèn điện?', a: 'Edison' },
      { q: 'Ai phát minh ra điện thoại?', a: 'Bell' },
      { q: 'Ai phát minh ra máy in?', a: 'Gutenberg' },
      { q: 'Ai phát minh ra máy bay?', a: 'Wright' },
      { q: 'Ai phát minh ra penicillin?', a: 'Fleming' },
      { q: 'Ai phát minh ra lý thuyết tương đối?', a: 'Einstein' },
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
      { q: 'Con gì biết bay nhưng không phải chim?', a: 'muỗi' },
      { q: 'Cái gì có nhiều răng nhưng không nhai?', a: 'lược' },
      { q: 'Cái gì càng nóng càng lạnh?', a: 'cốc kem' },
      { q: 'Cái gì đi khắp nơi nhưng không rờ khỏi chỗ?', a: 'con đường' },
    ],
    sequences: [
      { q: '2, 4, 6, 8, ... số tiếp theo?', a: '10' },
      { q: '1, 1, 2, 3, 5, ... số tiếp theo?', a: '8' },
      { q: '3, 6, 12, 24, ... số tiếp theo?', a: '48' },
      { q: '1, 4, 9, 16, ... số tiếp theo?', a: '25' },
      { q: '2, 3, 5, 7, 11, ... số tiếp theo?', a: '13' },
      { q: '1, 3, 6, 10, ... số tiếp theo?', a: '15' },
      { q: '1, 2, 4, 8, ... số tiếp theo?', a: '16' },
      { q: '5, 10, 20, 40, ... số tiếp theo?', a: '80' },
    ],
    patterns: [
      { q: 'Tam giác có mấy cạnh?', a: '3' },
      { q: 'Tứ giác có mấy góc?', a: '4' },
      { q: 'Hình lập phương có mấy mặt?', a: '6' },
      { q: 'Hình tròn không có gì?', a: 'góc' },
      { q: 'Một tuần có mấy ngày?', a: '7' },
      { q: 'Một giờ có mấy phút?', a: '60' },
    ],
  },
  tech: {
    computers: [
      { q: 'Bộ não của máy tính?', a: 'CPU' },
      { q: 'Bộ nhớ tạm thờ của máy tính?', a: 'RAM' },
      { q: 'Thiết bị lưu trữ dữ liệu lâu dài?', a: 'ổ cứng' },
      { q: 'Hệ điều hành của Apple?', a: 'macOS' },
      { q: 'Trình duyệt web của Google?', a: 'Chrome' },
      { q: 'Ngôn ngữ lập trình phổ biến do James Gosling tạo ra?', a: 'Java' },
      { q: 'Ngôn ngữ lập trình của web frontend?', a: 'JavaScript' },
      { q: 'Giao thức truyền web an toàn?', a: 'HTTPS' },
    ],
    internet: [
      { q: 'Địa chỉ của một trang web gọi là?', a: 'URL' },
      { q: 'Giao thức gửi email?', a: 'SMTP' },
      { q: 'Mạng xã hội lớn nhất thế giới?', a: 'Facebook' },
      { q: 'Công cụ tìm kiếm phổ biến nhất?', a: 'Google' },
      { q: 'Dịch vụ video của Google?', a: 'YouTube' },
      { q: 'Dịch vụ nhắn tin thuộc Meta?', a: 'WhatsApp' },
    ],
  },
  arts: {
    instruments: [
      { q: 'Nhạc cụ có phím đàn?', a: 'piano' },
      { q: 'Nhạc cụ dây nhỏ?', a: 'violin' },
      { q: 'Nhạc cụ thổi bằng đồng?', a: 'trumpet' },
      { q: 'Nhạc cụ gõ hình trống?', a: 'drum' },
      { q: 'Nhạc cụ 6 dây phổ biến?', a: 'guitar' },
      { q: 'Nhạc cụ gõ phím?', a: 'keyboard' },
    ],
    musicians: [
      { q: 'Nhạc sĩ nổi tiếng người Áo?', a: 'Mozart' },
      { q: 'Nhà soạn nhạc người Đức bị điếc?', a: 'Beethoven' },
      { q: 'Nhạc sĩ thiên tài người Đức?', a: 'Bach' },
      { q: 'Nhà soạn nhạc người Nga viết "Hồ thiên nga"?', a: 'Tchaikovsky' },
    ],
    artists: [
      { q: 'Bức tranh Mona Lisa của ai?', a: 'Leonardo' },
      { q: 'Họa sĩ nổi tiếng cắt tai?', a: 'Van Gogh' },
      { q: 'Trường phái hội họa của Picasso?', a: 'Lập thể' },
      { q: 'Họa sĩ vẽ "Vầng trăng máu"?', a: 'Munch' },
      { q: 'Họa sĩ ấn tượng Pháp vẽ "Bữa tiệc trôi nổi"?', a: 'Renoir' },
    ],
    colorMixing: [
      { q: 'Màu xanh da trời + vàng = ?', a: 'xanh lá' },
      { q: 'Màu đỏ + xanh dương = ?', a: 'tím' },
      { q: 'Màu đỏ + vàng = ?', a: 'cam' },
      { q: 'Trắng + đen = ?', a: 'xám' },
    ],
    literature: [
      { q: 'Tác giả Truyện Kiều?', a: 'Nguyễn Du' },
      { q: 'Nhà văn nổi tiếng Việt Nam viết "Số đỏ"?', a: 'Vũ Trọng Phụng' },
      { q: 'Nhà thơ nổi tiếng với "Tố Hữu"?', a: 'Tố Hữu' },
      { q: 'Tác giả "Harry Potter"?', a: 'J.K. Rowling' },
      { q: 'Tác giả "Những người khốn khổ"?', a: 'Victor Hugo' },
    ],
  },
  sports: {
    olympics: [
      { q: 'Thế vận hội Olympic được tổ chức mấy năm một lần?', a: '4' },
      { q: 'Màu của 5 vòng tròn Olympic?', a: 'xanh, vàng, đen, xanh lá, đỏ' },
      { q: 'Quốc gia đăng cai Olympic 2024?', a: 'Pháp' },
      { q: 'Môn thể thao vua?', a: 'bóng đá' },
    ],
    football: [
      { q: 'Một đội bóng đá có bao nhiêu cầu thủ trên sân?', a: '11' },
      { q: 'Giải bóng đá vô địch thế giới gọi là?', a: 'World Cup' },
      { q: 'Cầu thủ nổi tiếng người Argentina?', a: 'Messi' },
      { q: 'Cầu thủ nổi tiếng người Bồ Đào Nha?', a: 'Ronaldo' },
    ],
  },
  hard: {
    math: [
      { q: '15² = ?', a: '225' },
      { q: '√225 = ?', a: '15' },
      { q: '1 + 2 + 3 + ... + 10 = ?', a: '55' },
      { q: 'Tổng góc trong tam giác?', a: '180' },
      { q: 'Số nguyên tố nhỏ nhất?', a: '2' },
      { q: '1/2 + 1/3 = ?', a: '5/6' },
      { q: '20% của 120 = ?', a: '24' },
      { q: '3! = ?', a: '6' },
      { q: '2^10 = ?', a: '1024' },
      { q: 'Số Pi xấp xỉ?', a: '3,14' },
    ],
    mixed: [
      { q: 'Thủ đô của Úc?', a: 'Canberra' },
      { q: 'Nguyên tố hóa học có ký hiệu Fe?', a: 'Sắt' },
      { q: 'Năm Columbus phát hiện châu Mỹ?', a: '1492' },
      { q: 'Quốc gia đông dân nhất thế giới?', a: 'Ấn Độ' },
      { q: 'Đơn vị đo cường độ dòng điện?', a: 'Ampe' },
      { q: 'Tác giả Truyện Kiều?', a: 'Nguyễn Du' },
      { q: 'Hành tinh lớn nhất Hệ Mặt Trờ?', a: 'Sao Mộc' },
      { q: 'Đại dương nhỏ nhất?', a: 'Bắc Băng Dương' },
      { q: 'Ai phát minh ra điện thoại?', a: 'Bell' },
      { q: 'Nước nào đăng cai World Cup 2022?', a: 'Qatar' },
    ]
  }
};

/* ---------- Topic mapping for distractor pools ---------- */
const POOL_TOPIC_MAP = {
  addEasy: 'math', addMedium: 'math', addHard: 'math',
  subEasy: 'math', subMedium: 'math', subHard: 'math',
  mulEasy: 'math', mulMedium: 'math', mulHard: 'math',
  divEasy: 'math', divMedium: 'math', divHard: 'math',
  mixed: 'math', fraction: 'math', decimal: 'math',
  square: 'math', sqrt: 'math', cube: 'math',
  percent: 'math', equation: 'math', ratio: 'math', sequence: 'math',
  vocabAnimals: 'animals', vocabColors: 'colors', vocabFood: 'food',
  vocabFamily: 'family', vocabSchool: 'school', vocabWeather: 'weather',
  vocabBody: 'body', vocabJobs: 'jobs', vocabTransport: 'transport',
  vocabHouse: 'house', numbers: 'numbers', days: 'days', months: 'months',
  prepositions: 'prepositions', pronouns: 'pronouns', tenses: 'tenses',
  antonyms: 'antonyms', synonyms: 'synonyms', articles: 'articles', plural: 'plural',
  elements: 'elements', biology: 'biology', physics: 'physics',
  chemistry: 'chemistry', astronomy: 'astronomy', earth: 'earth',
  vietnam: 'vietnam', world: 'world', capitals: 'capitals',
  rivers: 'rivers', mountains: 'mountains',
  riddles: 'riddles', sequences: 'sequences', patterns: 'patterns',
  computers: 'computers', internet: 'internet',
  instruments: 'instruments', musicians: 'musicians',
  artists: 'artists', colorMixing: 'colorMixing', literature: 'literature',
  olympics: 'olympics', football: 'football',
  inventors: 'inventors',
  mixed: 'hard'
};

/* ---------- Dynamic math question generators ---------- */
const DYNAMIC_CACHE = new Map();

function getDynamicPool(key, generator, level) {
  const cacheKey = `${key}:${level}`;
  if (!DYNAMIC_CACHE.has(cacheKey)) {
    DYNAMIC_CACHE.set(cacheKey, generator(level));
  }
  return DYNAMIC_CACHE.get(cacheKey);
}

function generateAddQuestions(level) {
  const count = 32;
  const pairs = [];
  const gen = level <= 2 ? () => [randInt(1, 9), randInt(1, 9)]
          : level <= 6 ? () => [randInt(10, 99), randInt(10, 99)]
                       : () => [randInt(100, 999), randInt(100, 999)];
  const used = new Set();
  while (pairs.length < count) {
    const [a, b] = gen();
    const key = `${a}+${b}`;
    if (used.has(key)) continue;
    used.add(key);
    pairs.push({ q: `${a} + ${b} = ?`, a: String(a + b) });
  }
  return pairs;
}

function generateSubQuestions(level) {
  const count = 32;
  const pairs = [];
  const gen = level <= 2 ? () => { const a = randInt(2, 9), b = randInt(1, a); return [a, b]; }
          : level <= 6 ? () => { const a = randInt(10, 99), b = randInt(1, a); return [a, b]; }
                       : () => { const a = randInt(100, 999), b = randInt(10, a); return [a, b]; };
  const used = new Set();
  while (pairs.length < count) {
    const [a, b] = gen();
    const key = `${a}-${b}`;
    if (used.has(key)) continue;
    used.add(key);
    pairs.push({ q: `${a} - ${b} = ?`, a: String(a - b) });
  }
  return pairs;
}

function generateMulQuestions(level) {
  const count = 32;
  const pairs = [];
  const gen = level <= 2 ? () => [randInt(1, 9), randInt(1, 9)]
          : level <= 6 ? () => [randInt(2, 12), randInt(2, 20)]
                       : () => [randInt(2, 30), randInt(10, 50)];
  const used = new Set();
  while (pairs.length < count) {
    const [a, b] = gen();
    const key = `${a}*${b}`;
    if (used.has(key)) continue;
    used.add(key);
    pairs.push({ q: `${a} × ${b} = ?`, a: String(a * b) });
  }
  return pairs;
}

function generateDivQuestions(level) {
  const count = 32;
  const pairs = [];
  const gen = level <= 2 ? () => { const b = randInt(2, 9), a = b * randInt(2, 9); return [a, b]; }
          : level <= 6 ? () => { const b = randInt(2, 12), a = b * randInt(2, 20); return [a, b]; }
                       : () => { const b = randInt(2, 25), a = b * randInt(2, 40); return [a, b]; };
  const used = new Set();
  while (pairs.length < count) {
    const [a, b] = gen();
    const key = `${a}/${b}`;
    if (used.has(key)) continue;
    used.add(key);
    pairs.push({ q: `${a} ÷ ${b} = ?`, a: String(Math.round(a / b)) });
  }
  return pairs;
}

function generatePercentQuestions(level) {
  const count = 32;
  const pairs = [];
  const gen = level <= 2 ? () => [randInt(1, 9) * 10, randInt(1, 9) * 10]
          : level <= 6 ? () => [randInt(1, 20) * 5, randInt(2, 20) * 10]
                       : () => [randInt(1, 50), randInt(10, 200)];
  const used = new Set();
  while (pairs.length < count) {
    const [p, base] = gen();
    const key = `${p}%${base}`;
    if (used.has(key)) continue;
    used.add(key);
    const raw = p * base / 100;
    const ans = Number.isInteger(raw) ? String(raw) : String(raw.toFixed(2)).replace('.', ',');
    pairs.push({ q: `${p}% của ${base} = ?`, a: ans });
  }
  return pairs;
}

function generateSquareQuestions(level) {
  const minN = level <= 2 ? 2 : level <= 6 ? 5 : 10;
  const maxN = level <= 2 ? 9 : level <= 6 ? 20 : 50;
  const count = Math.min(24, maxN - minN + 1);
  const nums = [];
  const gen = level <= 2 ? () => randInt(2, 9)
          : level <= 6 ? () => randInt(5, 20)
                       : () => randInt(10, 50);
  const used = new Set();
  while (nums.length < count) {
    const n = gen();
    if (used.has(n)) continue;
    used.add(n);
    nums.push({ q: `${n}² = ?`, a: String(n * n) });
  }
  return nums;
}

function generateSqrtQuestions(level) {
  const minN = level <= 2 ? 1 : level <= 6 ? 5 : 10;
  const maxN = level <= 2 ? 5 : level <= 6 ? 15 : 30;
  const count = Math.min(24, maxN - minN + 1);
  const nums = [];
  const gen = level <= 2 ? () => randInt(1, 5)
          : level <= 6 ? () => randInt(5, 15)
                       : () => randInt(10, 30);
  const used = new Set();
  while (nums.length < count) {
    const n = gen();
    if (used.has(n)) continue;
    used.add(n);
    nums.push({ q: `√${n * n} = ?`, a: String(n) });
  }
  return nums;
}

function generateEquationQuestions(level) {
  const count = 32;
  const qs = [];
  const used = new Set();
  while (qs.length < count) {
    let q, a;
    if (level <= 2) {
      if (Math.random() < 0.5) {
        const x = randInt(1, 9);
        const b = randInt(1, 9);
        const c = x + b;
        q = `x + ${b} = ${c}, x = ?`;
        a = String(x);
      } else {
        const x = randInt(1, 9);
        const b = randInt(0, x);
        const c = x - b;
        q = `x - ${b} = ${c}, x = ?`;
        a = String(x);
      }
    } else if (level <= 6) {
      const type = randInt(0, 2);
      if (type === 0) {
        const aCoef = randInt(2, 5);
        const x = randInt(2, 12);
        const c = aCoef * x;
        q = `${aCoef}x = ${c}, x = ?`;
        a = String(x);
      } else if (type === 1) {
        const aCoef = randInt(2, 5);
        const x = randInt(2, 10);
        const b = randInt(1, 9);
        const c = aCoef * x + b;
        q = `${aCoef}x + ${b} = ${c}, x = ?`;
        a = String(x);
      } else {
        const b = randInt(2, 9);
        const x = randInt(2, 20);
        q = `x ÷ ${b} = ${x}, x = ?`;
        a = String(x * b);
      }
    } else {
      const type = randInt(0, 2);
      if (type === 0) {
        const aCoef = randInt(3, 9);
        const x = randInt(5, 20);
        const b = randInt(2, 15);
        const c = aCoef * x - b;
        q = `${aCoef}x - ${b} = ${c}, x = ?`;
        a = String(x);
      } else if (type === 1) {
        const aCoef = randInt(2, 5);
        const cCoef = randInt(6, 9);
        const x = randInt(5, 20);
        const d = randInt(1, 20);
        const b = cCoef * x + d - aCoef * x;
        q = `${aCoef}x + ${b} = ${cCoef}x + ${d}, x = ?`;
        a = String(x);
      } else {
        const b = randInt(3, 12);
        const x = randInt(5, 20);
        q = `x ÷ ${b} = ${x}, x = ?`;
        a = String(x * b);
      }
    }
    if (used.has(q)) continue;
    used.add(q);
    qs.push({ q, a });
  }
  return qs;
}

/* ---------- Question context for smart distractors ---------- */
let _lastQuestion = null;
function setLastQuestion(q) { _lastQuestion = q; }
function getLastQuestion() { return _lastQuestion; }

function normalizeDecimal(s) {
  return String(s).replace(/,/g, '.');
}

function parseMathQuestion(qText) {
  if (!qText) return null;
  const t = normalizeDecimal(qText);
  let m;
  if ((m = t.match(/^(-?\d+(?:\.\d+)?)\s*([+\-])\s*(-?\d+(?:\.\d+)?)\s*=\s*\?/))) {
    return { op: m[2] === '+' ? 'add' : 'sub', a: parseFloat(m[1]), b: parseFloat(m[3]) };
  }
  if ((m = t.match(/^(-?\d+(?:\.\d+)?)\s*[×x]\s*(-?\d+(?:\.\d+)?)\s*=\s*\?/))) {
    return { op: 'mul', a: parseFloat(m[1]), b: parseFloat(m[2]) };
  }
  if ((m = t.match(/^(-?\d+(?:\.\d+)?)\s*÷\s*(-?\d+(?:\.\d+)?)\s*=\s*\?/))) {
    return { op: 'div', a: parseFloat(m[1]), b: parseFloat(m[2]) };
  }
  if ((m = t.match(/^(\d+(?:\.\d+)?)%\s*của\s*(\d+(?:\.\d+)?)\s*=\s*\?/i))) {
    return { op: 'percent', p: parseFloat(m[1]), base: parseFloat(m[2]) };
  }
  if ((m = t.match(/^(\d+)\s*²\s*=\s*\?/))) {
    return { op: 'square', a: parseFloat(m[1]) };
  }
  if ((m = t.match(/^√(\d+(?:\.\d+)?)\s*=\s*\?/))) {
    return { op: 'sqrt', a: parseFloat(m[1]) };
  }
  if ((m = t.match(/x\s*([+\-])\s*(\d+)\s*=\s*(\d+)/))) {
    return { op: 'eq', type: m[1], b: parseFloat(m[2]), c: parseFloat(m[3]) };
  }
  if ((m = t.match(/(\d+)x\s*=\s*(\d+)/))) {
    return { op: 'eq', type: 'ax', a: parseFloat(m[1]), c: parseFloat(m[2]) };
  }
  if ((m = t.match(/(\d+)x\s*([+\-])\s*(\d+)\s*=\s*(\d+)/))) {
    return { op: 'eq', type: 'ax+b', a: parseFloat(m[1]), sign: m[2], b: parseFloat(m[3]), c: parseFloat(m[4]) };
  }
  return null;
}

function computeExpected(ctx) {
  if (!ctx) return null;
  switch (ctx.op) {
    case 'add': return ctx.a + ctx.b;
    case 'sub': return ctx.a - ctx.b;
    case 'mul': return ctx.a * ctx.b;
    case 'div': return ctx.b !== 0 ? ctx.a / ctx.b : null;
    case 'percent': return ctx.p * ctx.base / 100;
    case 'square': return ctx.a * ctx.a;
    case 'sqrt': return Math.sqrt(ctx.a);
    case 'eq':
      if (ctx.type === '+') return ctx.c - ctx.b;
      if (ctx.type === '-') return ctx.c + ctx.b;
      if (ctx.type === 'ax') return ctx.c / ctx.a;
      if (ctx.type === 'ax+b') {
        const rhs = ctx.sign === '+' ? ctx.c - ctx.b : ctx.c + ctx.b;
        return rhs / ctx.a;
      }
      return null;
    default: return null;
  }
}

/* ---------- Distractor generators ---------- */

const FRACTION_CHARS = {
  '½': { value: 0.5, text: '½' },
  '⅓': { value: 1 / 3, text: '⅓' },
  '⅔': { value: 2 / 3, text: '⅔' },
  '¼': { value: 0.25, text: '¼' },
  '¾': { value: 0.75, text: '¾' }
};
const FRACTION_POOL = ['½', '⅓', '⅔', '¼', '¾'];

function isPlainNumber(v) {
  // Accept both dot and comma as decimal separator (Vietnamese convention)
  return /^-?\d+([.,]\d+)?$/.test(String(v));
}

function isUnicodeFraction(v) {
  return FRACTION_CHARS.hasOwnProperty(v);
}

/* ---------- Auto-build answer pools by topic ---------- */
const ANSWER_POOLS = {};
const ANSWER_TO_POOL = {};
Object.entries(QUESTION_BANK).forEach(([cat, pools]) => {
  Object.entries(pools).forEach(([poolName, questions]) => {
    const topic = POOL_TOPIC_MAP[poolName] || poolName;
    if (!ANSWER_POOLS[topic]) ANSWER_POOLS[topic] = new Set();
    questions.forEach(q => {
      const a = String(q.a).trim();
      if (!isPlainNumber(a) && !isUnicodeFraction(a)) {
        ANSWER_POOLS[topic].add(a);
        ANSWER_TO_POOL[a] = topic;
      }
    });
  });
});
Object.keys(ANSWER_POOLS).forEach(k => { ANSWER_POOLS[k] = Array.from(ANSWER_POOLS[k]); });

function numericDistractors(correct, count = 2) {
  const n = parseFloat(normalizeDecimal(correct));
  const out = [];
  const ctx = parseMathQuestion(_lastQuestion && _lastQuestion.q);
  const expected = computeExpected(ctx);
  const ctxValid = ctx && expected !== null && normalizeDecimal(String(expected)) === normalizeDecimal(String(correct));

  const addDistractor = (v) => {
    if (!Number.isFinite(v)) return;
    let s = Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2))).replace('.', ',');
    if (normalizeDecimal(s) === normalizeDecimal(String(correct))) return;
    if (!out.includes(s)) out.push(s);
  };

  const reverseDigits = (v) => {
    if (!Number.isInteger(v) || Math.abs(v) < 10) return null;
    const sign = v < 0 ? '-' : '';
    const rev = parseInt(String(Math.abs(v)).split('').reverse().join(''), 10);
    return parseFloat(sign + rev);
  };

  if (ctxValid && Number.isFinite(n)) {
    if (ctx.op === 'add') {
      const a = ctx.a, b = ctx.b, res = a + b;
      addDistractor(res + 1);
      addDistractor(res - 1);
      addDistractor(res + 10);
      addDistractor((a + 1) + b);
      addDistractor(a + (b + 1));
      addDistractor(reverseDigits(res));
    } else if (ctx.op === 'sub') {
      const a = ctx.a, b = ctx.b, res = a - b;
      addDistractor(res + 1);
      addDistractor(res - 1);
      addDistractor(res + 10);
      addDistractor(a + b);
      addDistractor(Math.abs(b - a));
      addDistractor(reverseDigits(res));
    } else if (ctx.op === 'mul') {
      const a = ctx.a, b = ctx.b, res = a * b;
      addDistractor(a * (b + 1));
      addDistractor(a * (b - 1));
      addDistractor((a + 1) * b);
      addDistractor((a - 1) * b);
      addDistractor(a + b);
      addDistractor(reverseDigits(res));
    } else if (ctx.op === 'div') {
      const a = ctx.a, b = ctx.b, res = a / b;
      if (Number.isInteger(res)) {
        addDistractor(res + 1);
        addDistractor(res - 1);
        addDistractor(res + b);
        addDistractor(a % b);
        if (b > 1 && a % (b + 1) === 0) addDistractor(a / (b + 1));
        if (b > 2 && a % (b - 1) === 0) addDistractor(a / (b - 1));
        addDistractor(reverseDigits(res));
      }
    } else if (ctx.op === 'percent') {
      const p = ctx.p, base = ctx.base, res = (p * base) / 100;
      addDistractor(p * base);
      addDistractor((p / 10) * base);
      addDistractor(res + 1);
      addDistractor(res - 1);
      addDistractor(res * 10);
    } else if (ctx.op === 'square') {
      const a = ctx.a, res = a * a;
      addDistractor(res + 1);
      addDistractor(res - 1);
      addDistractor(a + a);
      addDistractor(a * 2);
      addDistractor(res * 2);
    } else if (ctx.op === 'sqrt') {
      const a = ctx.a, res = Math.sqrt(a);
      if (Number.isInteger(res)) {
        addDistractor(res + 1);
        addDistractor(res - 1);
        addDistractor(res * 2);
        addDistractor(Math.round(res / 2));
      }
    } else if (ctx.op === 'eq') {
      addDistractor(n + 1);
      addDistractor(n - 1);
      addDistractor(n * 2);
      addDistractor(reverseDigits(n));
    }
  }

  // Fallback/generic heuristics
  while (out.length < count) {
    const offset = randInt(1, Math.max(2, Math.floor(Math.abs(n) || 1) + 3));
    const sign = Math.random() > 0.5 ? 1 : -1;
    let v;
    if (Number.isInteger(n)) {
      v = n + offset * sign;
    } else {
      v = Number((n + offset * sign * 0.5).toFixed(2));
    }
    addDistractor(v);
  }
  return out.slice(0, count);
}


function fractionDistractors(correct, count = 2) {
  const out = [];
  const info = FRACTION_CHARS[correct];
  const pool = FRACTION_POOL.filter(f => f !== correct);
  while (out.length < count) {
    if (info && Math.random() < 0.6 && pool.length > 0) {
      const cand = pick(pool);
      if (!out.includes(cand)) out.push(cand);
    } else {
      const base = info ? info.value : 0.5;
      const near = String(Math.round((base + (Math.random() > 0.5 ? 1 : -1) * randInt(1, 2))));
      if (near !== correct && !out.includes(near)) out.push(near);
    }
    if (out.length === 0 && pool.length === 0) {
      out.push('\u00bd', '\u00bc');
      break;
    }
  }
  return out.slice(0, count);
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
    O: ['H', 'C', 'Fe'],
    H: ['O', 'C', 'N'],
    C: ['O', 'Ca', 'Fe'],
    Fe: ['Au', 'Ag', 'Cu'],
    Au: ['Ag', 'Fe', 'Al'],
    Ag: ['Au', 'Fe', 'Cu'],
    Al: ['Fe', 'Ca', 'Si'],
    Ca: ['Na', 'Mg', 'Al'],
    'H2O': ['CO2', 'O2', 'NaCl'],
    Nito: ['Oxy', 'Hydro', 'Cacbon'],
    Oxy: ['Nito', 'Hydro', 'Clo'],
    NaCl: ['HCl', 'H2O', 'CO2'],
    HCl: ['H2SO4', 'NaCl', 'H2O'],
    Newton: ['Joule', 'Watt', 'Pascal'],
    Joule: ['Newton', 'Watt', 'Calo'],
    '300000km/s': ['150000km/s', '600000km/s', '100000km/s'],
    'Trái Đất': ['Sao Hỏa', 'Sao Kim', 'Sao Mộc'],
    'Mặt Trăng': ['Sao Hỏa', 'Sao Kim', 'Phobos'],
    phổi: ['tim', 'gan', 'thận'],
    tim: ['phổi', 'gan', 'thận'],
    dạdày: ['ruột', 'gan', 'thận'],
    tithể: ['nhân', 'ribosome', 'lysosome'],
    ADN: ['ARN', 'protein', 'lipid'],
    tếbào: ['mô', 'cơquan', 'hệcơquan'],
    'HàNội': ['Huế', 'ĐàNẵng', 'TP.HCM'],
    'TP.HCM': ['HàNội', 'ĐàNẵng', 'CầnThơ'],
    TrườngSơn: ['HoàngLiênSơn', 'BaVì', 'TamĐảo'],
    Hồng: ['CửuLong', 'Đà', 'SôngMã'],
    Fansipan: ['BaVì', 'TâyCônLĩnh', 'PhanXiPang'],
    'HạLong': ['NhaTrang', 'ĐàNẵng', 'PhúQuốc'],
    Tokyo: ['Osaka', 'Kyoto', 'Seoul'],
    Paris: ['London', 'Berlin', 'Rome'],
    Washington: ['NewYork', 'LosAngeles', 'Chicago'],
    London: ['Paris', 'Berlin', 'Madrid'],
    'TháiBìnhDương': ['ĐạiTâyDương', 'ẤnĐộDương', 'BắcBăngDương'],
    'Á-Âu': ['ChâuPhi', 'ChâuMỹ', 'NamCực'],
    'Ý': ['Pháp', 'TâyBanNha', 'HyLạp'],
    'AiCập': ['Libya', 'Sudan', 'Israel'],
    'ngườiViệt': ['ngườiHoa', 'ngườiChăm', 'ngườiThái'],
    '1285': ['1258', '1427', '1789'],
    '1954': ['1945', '1954', '1975'],
    '30/4/1975': ['2/9/1945', '1/5/1975', '19/8/1945'],
    '1945': ['1954', '1975', '1930'],
    '3500TCN': ['3000TCN', '4000TCN', '2500TCN'],
    Leonardo: ['Michelangelo', 'Raphael', 'VanGogh'],
    'TrungQuốc': ['AiCập', 'HyLạp', 'ẤnĐộ'],
    số: ['chữ', 'hình', 'màu'],
    chai: ['lọ', 'bình', 'hộp'],
    'đồnghồ': ['cáibóng', 'cánhquạt', 'bánhxe'],
    bàn: ['ghế', 'giường', 'tủ'],
    nước: ['xàphòng', 'chất tẩy', 'khăn'],
    kim: ['ghim', 'nútbấm', 'kẹp'],
    '10': ['8', '12', '9'],
    '8': ['7', '9', '10'],
    '48': ['36', '60', '24'],
    '25': ['16', '36', '20'],
    '13': ['11', '17', '15'],
    '225': ['125', '325', '256'],
    '15': ['12', '18', '20'],
    '55': ['45', '66', '50'],
    '180': ['90', '270', '360'],
    '2': ['1', '3', '5'],
    '5/6': ['2/3', '3/4', '1/2'],
    '24': ['20', '28', '30'],
    '6': ['4', '8', '9'],
    Canberra: ['Sydney', 'Melbourne', 'Brisbane'],
    Sắt: ['Vàng', 'Bạc', 'Đồng'],
    '1492': ['1500', '1488', '1510'],
    'ẤnĐộ': ['TrungQuốc', 'Mỹ', 'Indonesia'],
    Ampe: ['Volt', 'Ohm', 'Watt'],
    'NguyễnDu': ['NguyễnTrãi', 'HồXuânHương', 'TốHữu'],
    'SaoMộc': ['SaoThổ', 'SaoKim', 'SaoHỏa'],
    'BắcBăngDương': ['ẤnĐộDương', 'ĐạiTâyDương', 'TháiBìnhDương']
  };

  const lower = correct.toLowerCase().replace(/\s+/g, '');
  const poolKey = Object.keys(pools).find(k => k.toLowerCase().replace(/\s+/g, '') === lower);
  if (poolKey) {
    const cands = shuffle(pools[poolKey]);
    return cands.slice(0, count);
  }

  // Topic-aware fallback: if we know the topic of the correct answer,
  // prefer other answers from the same topic so distractors stay relevant.
  // Within the topic, prefer answers with similar length or starting letter.
  const topic = ANSWER_TO_POOL[correct];
  if (topic && ANSWER_POOLS[topic]) {
    const topicPool = ANSWER_POOLS[topic].filter(v => v !== correct);
    if (topicPool.length >= count) {
      const similar = topicPool.filter(v => {
        const vl = v.toLowerCase().replace(/\s+/g, '');
        return vl[0] === lower[0] || Math.abs(vl.length - lower.length) <= 3;
      });
      const cands = shuffle(similar.length >= count ? similar : topicPool);
      return cands.slice(0, count);
    }
  }

  // Generic fallback: build a pool of all non-numeric answers and pick ones
  // that look similar (same first letter or similar length).
  const genericPool = (ALL_STRING_ANSWERS || []).filter(v => v !== correct);
  const similar = genericPool.filter(v => {
    const vl = v.toLowerCase().replace(/\s+/g, '');
    return vl[0] === lower[0] || Math.abs(vl.length - lower.length) <= 2;
  });
  const cands = shuffle(similar.length >= count ? similar : genericPool);
  const result = cands.slice(0, count).map(v => String(v));
  while (result.length < count) result.push('?');
  return result;
}

function distractorsFor(correct, type = 'number') {
  if (isUnicodeFraction(correct)) {
    return fractionDistractors(correct, 2);
  }
  if (isPlainNumber(correct)) {
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
function generateSegment(startX, startY, difficulty, seed, addStartPad = true, segmentIndex) {
  const rng = makeSeededRandom(seed);
  const platforms = [];
  const movingPlatforms = [];
  const hazards = [];
  const windZones = [];
  const enemies = [];
  const candidateSpots = [];
  const mainSpots = [];

  let x = startX;
  let y = startY;
  const yRange = { min: 80, max: 520 };
  const minLength = 1800 + difficulty * 100;

  if (segmentIndex === undefined) {
    segmentIndex = Math.max(0, Math.round((seed - (typeof runState !== 'undefined' ? runState.seedOffset : 0)) / 999983));
  }

  const isBoss = segmentIndex > 0 && segmentIndex % 10 === 9;
  const bossBoost = isBoss ? 1.35 : 1;

  const getTheme = (idx) => {
    if (idx < 10) return { name: 'grass', top: '#4ade80', base: '#78350f' };
    if (idx < 20) return { name: 'ice', top: '#93c5fd', base: '#e0f2fe' };
    if (idx < 30) return { name: 'desert', top: '#fdba74', base: '#c2410c' };
    return { name: 'lava', top: '#7f1d1d', base: '#4c1d95' };
  };

  // Reachability constraints using normal jump as the guaranteed baseline.
  const MAX_NORMAL_GAP = 170;
  const MAX_NORMAL_DY = 100;

  if (addStartPad) {
    const startW = 170;
    platforms.push({ x: startX, y: startY, w: startW, h: 28, type: 'normal', theme: getTheme(segmentIndex) });
    x += startW;
  }

  while (x - startX < minLength * bossBoost) {
    const w = seededRandInt(rng, 90, 180);

    // Pick vertical change first, then clamp reachable gap.
    const maxDyUp = Math.min(MAX_NORMAL_DY, y - yRange.min);
    const maxDyDown = Math.min(MAX_NORMAL_DY, yRange.max - y);
    const dy = seededRandInt(rng, -maxDyUp, maxDyDown);

    // Horizontal reach shrinks as vertical change grows.
    const absDy = Math.abs(dy);
    const gapMax = Math.min(MAX_NORMAL_GAP, Math.floor(MAX_NORMAL_GAP - absDy * 0.55));
    const gapMin = Math.min(70, Math.max(50, gapMax - 40));
    const gap = seededRandInt(rng, gapMin, gapMax);

    x += gap;
    y = Math.max(yRange.min, Math.min(yRange.max, y + dy));

    // Avoid overlapping with the previous platform
    const lastP = platforms[platforms.length - 1];
    if (lastP && x < lastP.x + lastP.w + 30) {
      x = lastP.x + lastP.w + 30;
    }

    let type = 'normal';
    if (segmentIndex >= 20 && rng() < 0.22) type = 'crumble';
    else if (segmentIndex >= 15 && rng() < 0.28) type = 'ice';

    const theme = getTheme(segmentIndex);
    const platform = { x, y, w, h: 24, type, theme };
    if (type === 'crumble') platform.crumbleTimer = null;
    platforms.push(platform);

    // Main-path collectable spot
    if (platforms.length > 1) {
      const spot = { x: x + w / 2 - 17, y: y - 70 };
      candidateSpots.push(spot);
      mainSpots.push(spot);
    }

    // Optional side platform (alternative route, may need double jump)
    if (rng() < 0.35 + difficulty * 0.03) {
      const sideDir = rng() < 0.5 ? -1 : 1;
      const sideY = Math.max(yRange.min, Math.min(yRange.max, y + sideDir * seededRandInt(rng, 90, 150)));
      const sideW = seededRandInt(rng, 60, 110);
      const sideX = x + seededRandInt(rng, -w - 40, -50);
      if (sideX > startX + 60 && sideX + sideW + 20 < x) {
        platforms.push({ x: sideX, y: sideY, w: sideW, h: 22, type, theme });
        if (rng() < 0.5) {
          candidateSpots.push({ x: sideX + sideW / 2 - 17, y: sideY - 70 });
        }
      }
    }

    x += w;

    // Moving bridge platform across the gap
    if (rng() < 0.28 + difficulty * 0.04) {
      const mx = x - w - gap / 2 - 45;
      const my = Math.max(150, Math.min(470, y + seededRandInt(rng, -60, 60)));
      movingPlatforms.push({
        x: mx, y: my, w: 90, h: 22,
        dx: seededRand(rng, 0.9, 2.2) * (rng() > 0.5 ? 1 : -1),
        range: seededRandInt(rng, 70, 140),
        originX: mx
      });
    }

    // Spike patch - keep away from the launch edge if a real jump is required
    if (difficulty > 0 && rng() < (0.20 + difficulty * 0.03) * bossBoost) {
      const sw = Math.min(w - 30, seededRandInt(rng, 30, 50));
      let sxMin = x - w + 15;
      let sxMax = x - 15 - sw;
      if (gap > 120) {
        sxMax = Math.min(sxMax, x - 45 - sw);
      }
      if (sxMin <= sxMax) {
        const sx = seededRandInt(rng, sxMin, sxMax);
        hazards.push({ x: sx, y: y - 20, w: sw, h: 20 });
      }
    }

    // Floor spikes below a gap
    if (rng() < 0.16) {
      const fw = seededRandInt(rng, 40, 80);
      const fx = x - gap / 2 - fw / 2;
      hazards.push({ x: fx, y: 585, w: fw, h: 15 });
    }

    // Wind zones from segment 10+
    if (segmentIndex >= 10 && rng() < 0.18) {
      const wzW = seededRandInt(rng, 160, 300);
      const wzH = seededRandInt(rng, 250, 420);
      const wzX = x - gap - w / 2;
      const wzY = yRange.max - wzH + 40;
      const force = -0.18 - rng() * 0.22;
      windZones.push({ x: wzX, y: wzY, w: wzW, h: wzH, force });
    }

    // Moving enemies from segment 25+
    if (segmentIndex >= 25 && rng() < 0.16) {
      const ex = x - w / 2 - 15;
      const ey = y - 30;
      const range = seededRandInt(rng, 40, 90);
      enemies.push({
        x: ex, y: ey, w: 30, h: 30,
        dx: seededRand(rng, 0.9, 1.8) * (rng() > 0.5 ? 1 : -1),
        range, originX: ex, type: 'walker'
      });
    }
  }

  // Final reward platform reachable from the last generated platform
  const finalW = 180;
  const finalGapMax = Math.min(110 * bossBoost, MAX_NORMAL_GAP);
  const finalGap = seededRandInt(rng, 70 * bossBoost, finalGapMax);
  const finalDyMaxUp = Math.min(MAX_NORMAL_DY, y - yRange.min);
  const finalDyMaxDown = Math.min(MAX_NORMAL_DY, yRange.max - y);
  const finalDy = seededRandInt(rng, -finalDyMaxUp, finalDyMaxDown);
  const finalX = x + finalGap;
  const finalY = Math.max(yRange.min, Math.min(yRange.max, y + finalDy));
  platforms.push({ x: finalX, y: finalY, w: finalW, h: 28, type: 'normal', theme: getTheme(segmentIndex) });
  const finalSpot = { x: finalX + finalW / 2 - 17, y: finalY - 70 };
  candidateSpots.push(finalSpot);
  mainSpots.push(finalSpot);

  // Last 3 main-path spots are reserved for answers
  const answerXs = mainSpots.slice(-3);
  let powerupSpots = [];
  const available = candidateSpots.filter(s => !answerXs.includes(s));
  const powerupCount = available.length > 0 ? (rng() < 0.65 ? 1 : 2) : 0;
  while (powerupSpots.length < powerupCount && available.length > 0) {
    const idx = Math.floor(rng() * available.length);
    powerupSpots.push(available.splice(idx, 1)[0]);
  }

  return {
    platforms,
    movingPlatforms,
    hazards,
    windZones,
    enemies,
    answerXs,
    powerupSpots,
    endX: finalX + finalW,
    endY: finalY,
    isBoss
  };
}


function makeSegmentAnswers(rng, correct, answerXs) {
  const [d1, d2] = distractorsFor(correct);
  const positions = answerXs.slice(-3);
  // Randomly shuffle which position holds the correct answer so players
  // actually read the question instead of always rushing to the last item.
  const values = seededShuffle(rng, [
    { v: correct, c: true },
    { v: d1, c: false },
    { v: d2, c: false }
  ]);
  return positions.slice(0, 3).map((p, i) => ({
    x: Math.round(p.x),
    y: Math.round(p.y),
    value: values[i].v,
    correct: values[i].c
  }));
}


/* ---------- Power-ups ---------- */
const POWERUP_TYPES = [
  { type: 'life', label: '+1', color: '#ef4444', glow: 'rgba(239,68,68,0.45)' },
  { type: 'invincible', label: '★', color: '#f59e0b', glow: 'rgba(245,158,11,0.45)' },
  { type: 'highjump', label: '↑', color: '#3b82f6', glow: 'rgba(59,130,246,0.45)' }
];

function makeSegmentPowerups(rng, spots) {
  return spots.map(spot => {
    const p = seededPick(rng, POWERUP_TYPES);
    return {
      x: Math.round(spot.x),
      y: Math.round(spot.y),
      ...p
    };
  });
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

const ALL_STRING_ANSWERS = (() => {
  const set = new Set();
  ALL_QUESTIONS.forEach(q => {
    const a = String(q.a).trim();
    if (!isPlainNumber(a) && !isUnicodeFraction(a)) set.add(a);
  });
  return Array.from(set);
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

/* ---------- Hard / Boss question pool ---------- */
const HARD_QUESTIONS = (() => {
  const arr = [];
  Object.values(QUESTION_BANK.hard || {}).forEach(pool => arr.push(...pool));
  return shuffle(arr);
})();

function getBossQuestion(index) {
  return HARD_QUESTIONS[index % HARD_QUESTIONS.length];
}

/* ---------- Bonus stage generator ---------- */
function generateBonusSegment(startX, startY, seed) {
  const rng = makeSeededRandom(seed);
  const platforms = [];
  const hazards = [];
  const enemies = [];
  const coins = [];

  // Long flat run with coins
  const length = 2000;
  const groundY = 480;
  platforms.push({ x: startX, y: groundY, w: length, h: 40, type: 'normal' });

  for (let cx = startX + 120; cx < startX + length - 80; cx += 90) {
    if (rng() < 0.85) {
      const cy = groundY - 40 - rng() * 120;
      coins.push({ x: cx, y: cy, w: 24, h: 24, value: 10 });
    }
  }

  return {
    platforms, movingPlatforms: [], hazards, windZones: [], enemies,
    answerXs: [], powerupSpots: [], coins,
    endX: startX + length, endY: groundY, isBonus: true
  };
}

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
  const difficulty = Math.min(10, Math.floor(index / 2));
  const generatorKeys = [
    ['add', generateAddQuestions],
    ['sub', generateSubQuestions],
    ['mul', generateMulQuestions],
    ['div', generateDivQuestions],
    ['percent', generatePercentQuestions],
    ['square', generateSquareQuestions],
    ['sqrt', generateSqrtQuestions],
    ['equation', generateEquationQuestions]
  ];
  const [key, generator] = generatorKeys[index % generatorKeys.length];
  const pool = getDynamicPool(key, generator, difficulty);
  const q = pool[index % pool.length];
  setLastQuestion(q);
  return q;
}


// Expose for the game engine
if (typeof window !== 'undefined') {
  window.LEVELS = LEVELS;
  window.getLevel = getLevel;
  window.getTotalLevels = getTotalLevels;
  window.generateSegment = generateSegment;
  window.makeSegmentAnswers = makeSegmentAnswers;
  window.makeSegmentPowerups = makeSegmentPowerups;
  window.getSegmentQuestion = getSegmentQuestion;
  window.getBossQuestion = getBossQuestion;
  window.generateBonusSegment = generateBonusSegment;
  window.POWERUP_TYPES = POWERUP_TYPES;
  window.HARD_QUESTIONS = HARD_QUESTIONS;
}
