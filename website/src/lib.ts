// Tiện ích liên kết nội bộ: tự ghép BASE_URL (Astro) để link hoạt động
// đúng cả khi site chạy ở gốc domain (BASE_URL='/') lẫn subpath GitHub Pages
// (BASE_URL='/main/'). Mọi link nội bộ trong HTML phải dùng href() thay vì hard-code '/...'.
export function href(path = '/'): string {
  const base = import.meta.env.BASE_URL || '/';
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return b + p;
}

/** URL tuyệt đối (dùng cho RSS/canonical khi cần). */
export function abs(path = '/'): string {
  const base = import.meta.env.BASE_URL || '/';
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  return b + (path.startsWith('/') ? path : `/${path}`);
}
