/**
 * progress.js — tiến độ học, lưu ngay trên trình duyệt của người học (localStorage).
 * Không có tài khoản/backend: đổi trình duyệt hoặc xoá dữ liệu site thì tiến độ về 0.
 */
import { storage } from '../core/dom.js';

export function createProgress(courseId) {
  const key = `course:${courseId}:done`;

  const read = () => {
    try { return new Set(JSON.parse(storage.read(key)) || []); } catch { return new Set(); }
  };
  const write = done => storage.write(key, JSON.stringify([...done]));

  return {
    isDone: lessonId => read().has(lessonId),

    /** Số bài đã học trong `lessons` (bỏ qua id cũ không còn trong giáo trình). */
    count(lessons) {
      const done = read();
      return lessons.filter(l => done.has(l.id)).length;
    },

    set(lessonId, isDone) {
      const done = read();
      if (isDone) done.add(lessonId);
      else done.delete(lessonId);
      write(done);
    },
  };
}
