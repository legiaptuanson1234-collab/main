// Lớp provider: thay đổi model/endpoint mà không phải viết lại pipeline.
// Hiện tại: Ollama (API native) chạy local. Chỉ gọi HTTP tới host được cấu hình (mặc định 127.0.0.1).

export interface LlmProvider {
  readonly name: string;
  generate(prompt: string, opts?: { maxTokens?: number; temperature?: number }): Promise<string>;
  isAvailable(): Promise<boolean>;
}

export class OllamaProvider implements LlmProvider {
  readonly name = 'ollama';
  private baseUrl: string;
  private model: string;
  private timeoutMs: number;
  constructor(baseUrl: string, model: string, timeoutMs: number) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const r = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) return false;
      const data = (await r.json()) as { models?: { name: string }[] };
      const family = this.model.split(':')[0];
      return (data.models ?? []).some((m) => m.name.startsWith(family));
    } catch {
      return false;
    }
  }

  async generate(prompt: string, opts: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        // Qwen3 (và model "thinking" khác) mặc định dồn token vào suy luận ẩn,
        // khiến phần thân trả về rỗng. Tắt chế độ thinking để ra nội dung thật.
        think: false,
        options: { num_predict: opts.maxTokens ?? 2000, temperature: opts.temperature ?? 0.4 },
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as { response?: string; error?: string };
    if (data.error) throw new Error(`Ollama: ${data.error}`);
    return (data.response ?? '').trim();
  }
}

export class MockProvider implements LlmProvider {
  readonly name = 'mock';
  private canned: string;
  constructor(canned: string) {
    this.canned = canned;
  }
  async isAvailable(): Promise<boolean> {
    return true;
  }
  async generate(prompt: string): Promise<string> {
    return `${this.canned}\n(nhận prompt ${prompt.length} ký tự)`;
  }
}
