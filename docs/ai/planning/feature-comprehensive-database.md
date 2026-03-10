---
phase: planning
title: Comprehensive Chinese Database Ingestion (HSK & TOCFL)
description: A multi-phase data engineering plan to fully populate a dual-standard curriculum (HSK and TOCFL) with Vocabulary, Sentences, and Exercises.
---

# Master Plan: Comprehensive Database Ingestion

## Mục tiêu (Goal)
Hoàn thiện toàn bộ CSDL tiếng Trung bằng dữ liệu thực tế ở cả 2 giáo trình phổ biến nhất: **HSK** (Trung Quốc Đại lục) và **TOCFL** (Đài Loan). Xây dựng một Data Pipeline tự động nạp hàng ngàn từ vựng, phân cấp theo từng Level, kết hợp với các mẫu câu thực tế và bài tập động để tạo ra trải nghiệm học tập phong phú và toàn diện nhất.

Dự án này sẽ được chia thành 4 Giai đoạn (Phases) cốt lõi:

---

## Cấu trúc Dữ Liệu & Nguồn (Data Sources)

### 1. Phân tách Giáo trình (Dual-curriculum)
- CSDL sẽ hỗ trợ 2 hệ thống độc lập nhưng có thể chuyển đổi:
  - **TOCFL (Đài Loan)**: Phồn Thể làm gốc, dùng Chú Âm (Zhuyin) & Pinyin. Phân cấp từ Band A đến Band C. Nguồn: GitHub [PSeitz/tocfl].
  - **HSK (Đại Lục)**: Giản Thể làm gốc, dùng Pinyin. Phân cấp từ HSK 1 đến HSK 6. Nguồn: GitHub [clem109/hsk-vocabulary].

### 2. Từ vựng & Nghĩa (Vocabulary Base)
- Sử dụng danh sách từ vựng gốc của HSK/TOCFL để xây dựng "bộ xương".
- Mở rộng nghĩa tiếng Việt và Âm Hán Việt bằng cách mapping (ghép) với từ điển `CVDICT` mà chúng ta đã xử lý ở tính năng trước.

### 3. Mẫu câu (Sentences)
- Nguồn: **Tatoeba** (Bộ câu song ngữ Trung-Việt). Kho dữ liệu khổng lồ với hàng chục ngàn mẫu câu thực tế.

### 4. Bài tập (Exercises)
- Sinh tự động (Auto-generated) dựa trên tập từ vựng và mẫu câu của từng Lesson thông qua thuật toán rải rác (randomization algorithms).

---

## Phân rã Giai đoạn (Phases)

### Phase 1: Dual-Syllabus Structuring (Xây dựng Cấu trúc 2 Giáo trình)
- Xóa bỏ các Topic/Lesson dạng "chơi" (Greetings, Numbers...).
- Cập nhật Data Models: Thêm cờ (flag) `standard: 'HSK' | 'TOCFL'` và `level` vào model `Topic`.
- **TOCFL Ingestion**: Tự động tải và parse danh sách từ vựng TOCFL. Gom nhóm thành các Topic (VD: "TOCFL Band A Level 1") và cắt nhỏ mỗi Topic thành các `Lesson` (mỗi bài ~25-30 từ).
- **HSK Ingestion**: Tương tự, tải và parse HSK 1-6. Gom nhóm thành Topic (VD: "HSK 1") và cắt nhỏ tương tự.
- Ghi dữ liệu vào Mongoose Collections (`Topics`, `Lessons`, `Vocabulary`).

### Phase 2: Massive Sentence Mining (Khai thác & Ghép Mẫu Câu)
- Xây dựng Script tải/đọc file CSV (hoặc TSV) từ Tatoeba.
- Thuật toán Text Matching: Quét qua tất cả bài học (của cả HSK và TOCFL). Với mỗi từ vựng trong bài, tìm kiếm và bốc ra 2-4 mẫu câu phù hợp nhất từ Tatoeba.
- Đảm bảo câu có đầy đủ Hán Tự, Pinyin, và nghĩa Tiếng Việt (Translation).
- Lưu hàng ngàn mẫu câu đã match vào Collection `Sentences`.

### Phase 3: Auto-generating Exercises (Thuật toán Sinh Bài Tập Động)
- Xây dựng Engine sinh bài tập cho mỗi Lesson:
  1. **Multiple Choice (Trắc nghiệm)**: "Nghĩa của từ [X] là gì?". Engine bốc 1 đáp án đúng và 3 đáp án sai ngẫu nhiên cùng cấp độ.
  2. **Matching (Nối từ)**: Lấy ngẫu nhiên 4 cặp Từ - Nghĩa trong Lesson đó.
  3. **Fill in the Blank (Điền khuyết)**: Rút 1 câu từ `Sentences`, làm mờ (blank) từ vựng mục tiêu, yêu cầu người dùng gõ Pinyin hoặc Hán Tự.

### Phase 4: Full Pipeline Execution & Frontend Adaptation
- Chạy toàn bộ Data Pipeline (từ Phase 1 đến Phase 3) trên môi trường Backend Node.js.
- Seeding khoảng 5,000+ từ vựng và ~10,000+ mẫu câu lên MongoDB Atlas.
- Điều chỉnh Frontend: 
  - Thêm Toggle (Nút chuyển đổi) giữa hệ thống học "TOCFL" và "HSK" trên trang `TopicCatalogPage`.
  - Đảm bảo UI của App có khả năng render số lượng bài học khổng lồ (có thể thêm Pagination/Lazy loading nếu cần thiết sau này).

---
*Lịch trình Execution sẽ tự động bắt đầu từ Phase 1 sau khi tài liệu này được xác nhận hoàn thiện.*
