/**
 * syllabus.js — chuyển giáo trình (course.json) thành danh sách bài học có thứ tự.
 * File bài học: course/rag/lessons/<module.id>/<lesson.slug>.html
 *
 * course.json: { id, title, level, description,
 *                modules: [{ id, title, summary, lessons: [{ slug, title, minutes }] }] }
 */
import { courseHref } from '../core/paths.js';

/** Làm phẳng giáo trình thành danh sách bài theo thứ tự học, kèm vị trí và URL. */
export function flattenLessons(course) {
  return course.modules.flatMap((module, m) =>
    module.lessons.map((lesson, l) => ({
      ...lesson,
      id: `${module.id}/${lesson.slug}`,
      url: courseHref(`lessons/${module.id}/${lesson.slug}.html`),
      module,
      moduleNo: m + 1,
      lessonNo: l + 1,
    })));
}

/** Tổng thời lượng (phút) của các bài. */
export const totalMinutes = lessons => lessons.reduce((sum, l) => sum + l.minutes, 0);

/** Bài nên học tiếp: bài đầu tiên chưa hoàn thành, hoặc null nếu đã học hết. */
export const nextLesson = (lessons, progress) => lessons.find(l => !progress.isDone(l.id)) || null;
