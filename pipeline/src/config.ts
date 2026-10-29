// Cấu hình pipeline — đọc từ biến môi trường, không có secret.
// Giá trị này không phải mật khẩu; Ollama chạy local không cần key.

export interface PipelineConfig {
  ollamaBaseUrl: string;
  model: string;
  timeoutMs: number;
  websiteRoot: string; // đường dẫn đến thư mục website/
  contentDir: string; // nơi lưu bản nháp markdown
  publishDir: string; // thư mục guides của website
  logDir: string;
  lockFile: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): PipelineConfig {
  const root = process.cwd();
  return {
    ollamaBaseUrl: env.OLLAMA_URL || 'http://127.0.0.1:11434',
    // Qwen3:4b bị leak "thought chain" vào nội dung khi dùng cho viết bài (đã test 2026-10-29).
    // Qwen2.5:7b (4.7GB, Q4) cho nội dung sạch, tiếng Việt ổn trên RTX 4060 Laptop + 16GB RAM.
    model: env.OLLAMA_MODEL || 'qwen2.5:7b',
    timeoutMs: Number(env.OLLAMA_TIMEOUT_MS || 600000),
    websiteRoot: root,
    contentDir: root + '/pipeline/drafts',
    publishDir: root + '/website/src/content/guides',
    logDir: root + '/pipeline/logs',
    lockFile: root + '/pipeline/.lock',
  };
}
