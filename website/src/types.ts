/** Dữ liệu danh bạ công cụ AI.
 * Mỗi công cụ chỉ liệt kê các thuộc tính có căn cứ.
 * Trạng thái "miễn phí" được đánh dấu khi xác minh; nếu chưa xác minh -> freeTier: 'unverified'.
 */
export type Tool = {
  name: string;
  url: string;
  category: 'chat' | 'image' | 'video' | 'audio' | 'code' | 'search' | 'writing' | 'other';
  freeTier: 'yes' | 'limited' | 'no' | 'unverified';
  noCreditCard: boolean;
  offline?: boolean;
  languages?: string[];
  descriptionVi: string;
  bestForVi: string;
  limitationsVi: string;
  lastChecked: string; // ISO date — bắt buộc, dùng để cảnh báo thông tin cũ
  /** CHỈ điền khi đã có ID affiliate thật (được chương trình chấp thuận).
   * Mặc định: KHÔNG có field -> link hiển thị như link thường, không gắn nhãn
   * "đồng tác" (tránh bịa quan hệ đối tác). */
  affiliateUrl?: string;
  affiliateProgram?: string; // ví dụ "Canva Pro" — hiển thị cạnh badge khi có
};

/** Cấu hình sản phẩm số (Prompt & Template Kit) — xem src/data/product.json. */
export type ProductConfig = {
  product: string;
  version: string;
  updatedAt: string;
  license: string;
  freeDownload: {
    enabled: boolean;
    filename: string;
    whatYouGet: string;
    sizeNote: string;
  };
  premium: {
    enabled: boolean;
    url: string;
    price: string;
    provider: string;
    note: string;
  };
};
