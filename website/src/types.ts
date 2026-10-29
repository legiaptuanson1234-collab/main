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
};
