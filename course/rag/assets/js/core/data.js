/**
 * data.js — tải giáo trình khoá học (course/rag/course.json).
 */
import { courseHref } from './paths.js';

let request = null;

/** Giáo trình khoá học; chỉ fetch một lần cho mỗi trang. */
export function loadCourse() {
  request ||= fetch(courseHref('course.json')).then(res => {
    if (!res.ok) throw new Error(`Không tải được course.json (HTTP ${res.status})`);
    return res.json();
  });
  return request;
}
