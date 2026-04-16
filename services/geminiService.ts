
import { GoogleGenAI, Part } from "@google/genai";
import type { LessonPlanFormData } from './types';

const getTemplateInstructions = (template: '5512' | '2345'): string => {
  const objectivesSection = `
I. Yêu cầu cần đạt:
- Về kiến thức, kĩ năng: (Dựa vào thông tin bài học và tệp đính kèm, nêu cụ thể các kiến thức, kĩ năng HS cần đạt được, tương tự như trong giáo án mẫu.)
- Về phát triển năng lực: (Nêu cụ thể các năng lực chung và đặc thù cần phát triển, ví dụ: năng lực ngôn ngữ, năng lực giải quyết vấn đề...)
- Về phát triển phẩm chất: (Nêu cụ thể các phẩm chất cần hình thành, ví dụ: nhân ái, chăm chỉ, trách nhiệm.)
  `;

  const teachingAidsSection = `
II. Đồ dùng dạy học:
- (Liệt kê các đồ dùng cần thiết cho cả giáo viên và học sinh dưới dạng danh sách gạch đầu dòng, ví dụ: Laptop, ti vi, slide, phiếu bài tập, SGK, vở ghi...)
  `;

  const finalAdjustments = `
IV. Điều chỉnh sau bài dạy:
(Để trống phần này để giáo viên ghi chú sau khi dạy.)
---
`;

  if (template === '2345') {
    const activitiesSection2345 = `
III. Các hoạt động dạy học:
LƯU Ý CỰC KỲ QUAN TRỌNG: Cấu trúc của mỗi hoạt động chính (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng) phải tuân thủ nghiêm ngặt 4 thành phần theo tinh thần của Công văn 2345. Phải trình bày chi tiết 4 thành phần này cho MỖI HOẠT ĐỘNG, sau đó mới đến bảng mô tả chi tiết cách tổ chức.

Ví dụ cấu trúc cho một hoạt động:
**A. HOẠT ĐỘNG 1: KHỞI ĐỘNG**
**a. Mục tiêu:** (Nêu rõ mục tiêu của hoạt động khởi động)
**b. Nội dung:** (Mô tả nội dung, ví dụ: HS xem video, chơi trò chơi, trả lời câu hỏi...)
**c. Sản phẩm:** (Mô tả sản phẩm HS cần hoàn thành, ví dụ: câu trả lời, kết quả trò chơi, cảm nhận ban đầu...)
**d. Tổ chức thực hiện:**
(Phần này mô tả các bước cụ thể của GV và HS, trình bày dưới dạng bảng Markdown DUY NHẤT 2 cột cho TOÀN BỘ các hoạt động của bài học)

| Hoạt động của giáo viên | Hoạt động của học sinh |
| :---------------------- | :---------------------- |
| **1. Khởi động** | |
| ***- Chuyển giao nhiệm vụ:*** Giao nhiệm vụ... | - Nhận nhiệm vụ...      |
| ***- Thực hiện nhiệm vụ:*** Quan sát, hỗ trợ HS... | - Thực hiện...          |
| ***- Báo cáo, thảo luận:*** Mời đại diện HS... | - Báo cáo kết quả...    |
| ***- Kết luận, nhận định:*** Nhận xét, chốt và dẫn dắt vào bài mới. | - Lắng nghe, ghi nhận.   |
| **2. Hình thành kiến thức** | |
`;
    return `
YÊU CẦU ĐẦU RA VỀ CẤU TRÚC (THEO CV 2345):
AI phải tạo ra một KẾ HOẠCH BÀI DẠY HOÀN CHỈNH, trình bày rõ ràng, văn phong chuẩn sư phạm Việt Nam. Cấu trúc phải tuân thủ nghiêm ngặt theo mẫu sau:

${objectivesSection}
${teachingAidsSection}
${activitiesSection2345}
...tiếp tục với các hoạt động khác trong cùng 1 bảng...
|
${finalAdjustments}
`;
  }

  // Default to 5512
  const activitiesSection5512 = `
III. Các hoạt động dạy học:
LƯU Ý CỰC KỲ QUAN TRỌNG: Toàn bộ phần này phải được trình bày dưới dạng một bảng Markdown DUY NHẤT có 2 cột: "Hoạt động của giáo viên" và "Hoạt động của học sinh".
- Các giai đoạn chính như "1. Khởi động", "2. Khám phá", "3. Luyện tập", "4. Vận dụng" phải được đặt trong cột "Hoạt động của giáo viên".
- KHÔNG tạo nhiều bảng riêng lẻ cho mỗi hoạt động. Tất cả phải nằm trong cùng một cấu trúc bảng.

Ví dụ về cấu trúc bảng:
| Hoạt động của giáo viên | Hoạt động của học sinh |
| :---------------------- | :---------------------- |
| **1. Khởi động.**       |                         |
| - Sử dụng kĩ thuật Tia chớp... | - Thực hiện...          |
| - Dẫn dắt vào bài mới.    | - Nghe - Ghi vở.        |
| **2. Khám phá.**        |                         |
| **2.1. Bài tập 1: ...**  |                         |
| - Chia nhóm 3, thảo luận... | - Thảo luận làm bài...     |
| - Mời đại diện trình bày. | - Đại diện nhóm trình bày... |
  `;

  return `
YÊU CẦU ĐẦU RA VỀ CẤU TRÚC (THEO CV 5512):
AI phải tạo ra một KẾ HOẠCH BÀI DẠY HOÀN CHỈNH, trình bày rõ ràng, văn phong chuẩn sư phạm Việt Nam. Cấu trúc phải tuân thủ nghiêm ngặt theo mẫu sau:

${objectivesSection}
${teachingAidsSection}
${activitiesSection5512}
${finalAdjustments}
`;
};


const buildPrompt = (formData: LessonPlanFormData, modificationPrompt: string): string => {
  const {
    educationLevel,
    grade,
    subject,
    lessonTitle,
    duration,
    classCharacteristics,
    lessonPlanTemplate
  } = formData;

  const specialRequirements =
    educationLevel === 'Tiểu học'
      ? `LƯU Ý QUAN TRỌNG VỀ NỘI DUNG: Vì đây là kế hoạch bài dạy cho cấp Tiểu học, BẮT BUỘC lựa chọn và tích hợp ít nhất 2–3 kĩ thuật dạy học tích cực phù hợp (ví dụ: Tia chớp, Sơ đồ tư duy). Hoạt động phải lấy học sinh làm trung tâm, và ngôn ngữ phải cực kỳ dễ hiểu, phù hợp tâm lý lứa tuổi.`
      : `LƯU Ý QUAN TRỌNG VỀ NỘI DUNG: Vì đây là kế hoạch bài dạy cho cấp THCS, cần chú trọng phát triển năng lực tự học, hợp tác, giao tiếp và giải quyết vấn đề cho học sinh.`;

  const templateInstructions = getTemplateInstructions(lessonPlanTemplate);

  const pacingInstruction = duration > 1
    ? `
LƯU Ý ĐẶC BIỆT VỀ PHÂN CHIA TIẾT DẠY:
Vì bài học này kéo dài ${duration} tiết, bạn phải chia kế hoạch bài dạy thành các phần riêng biệt cho từng tiết (ví dụ: TIẾT 1, TIẾT 2,...).
YÊU CẦU BẮT BUỘC: Mỗi một tiết dạy phải bao gồm đầy đủ 4 hoạt động cốt lõi: 1. Khởi động; 2. Khám phá/Hình thành kiến thức; 3. Luyện tập; và 4. Vận dụng. Hãy phân bổ nội dung bài học một cách hợp lý vào các hoạt động của từng tiết để đảm bảo tính logic và liền mạch.
` : '';

  return `
Bạn là một hệ thống AI chuyên gia về Sư phạm Tiểu học và Trung học cơ sở Việt Nam, am hiểu sâu sắc Chương trình Giáo dục phổ thông 2018.

NHIỆM VỤ: Dựa vào thông tin dưới đây và nội dung các tệp đính kèm (nếu có), hãy tạo ra một KẾ HOẠCH BÀI DẠY (GIÁO ÁN) HOÀN CHỈNH theo mẫu Công văn ${lessonPlanTemplate}.

THÔNG TIN BÀI DẠY:
- Cấp học: ${educationLevel}
- Lớp: ${grade}
- Môn học: ${subject}
- Tên bài học / chủ đề: ${lessonTitle}
- Thời lượng (số tiết): ${duration}
- Đặc điểm lớp học: ${classCharacteristics || 'Lớp học bình thường, học sinh đa dạng về năng lực.'}

${templateInstructions}

HƯỚNG DẪN CHUNG VỀ NỘI DUNG:
- ƯU TIÊN HÀNG ĐẦU: Nội dung chi tiết của các hoạt động phải được xây dựng dựa trên các **tài liệu tham khảo** bạn được cung cấp. Sách giáo khoa (nếu có) chỉ là nền tảng.
- Nếu không có tài liệu tham khảo, nội dung phải được xây dựng dựa trên Sách giáo khoa thuộc bộ "Kết nối tri thức với cuộc sống".
- Phân tích kỹ nội dung từ các tệp Sách giáo khoa và **đặc biệt là các tài liệu tham khảo được đính kèm** để xây dựng nội dung chi tiết, chính xác, và phong phú hơn cho các hoạt động dạy học.
- Bám sát mục tiêu bài học để thiết kế hoạt động.
- KHÔNG giải thích lý thuyết dài dòng, chỉ tập trung vào việc tạo KẾ HOẠCH DẠY HỌC.

${pacingInstruction}

${specialRequirements}

${modificationPrompt}
  `;
};

export async function* generateLessonPlan(formData: LessonPlanFormData, modificationPrompt: string, processedParts: Part[]): AsyncGenerator<string> {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const textPrompt = buildPrompt(formData, modificationPrompt);
  const modelName = 'gemini-3-pro-preview';

  try {
    const allParts = [{ text: textPrompt }, ...processedParts];
    const stream = await ai.models.generateContentStream({ 
      model: modelName, 
      contents: { parts: allParts } 
    });
    
    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Error calling Gemini AI:", error);
    if (error.toString().includes("RESOURCE_EXHAUSTED") || error.toString().includes("429")) {
        throw new Error("Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.");
    }
    throw new Error("Không thể tạo giáo án từ AI. Vui lòng kiểm tra lại tệp đính kèm và thử lại.");
  }
};

export const extractLessonTitleFromFile = async (processedPart: Part): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = "Dựa vào nội dung của tệp đính kèm, hãy xác định và trích xuất chính xác tên bài học hoặc chủ đề chính. Chỉ trả về duy nhất tên bài học, không thêm bất kỳ văn bản giới thiệu hay giải thích nào khác. Ví dụ: 'Sơn Tinh, Thủy Tinh'.";

  const parts = [
    { text: prompt },
    processedPart,
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
    });

    if (response && response.text) {
      return response.text.trim().replace(/['"*]/g, '');
    } else {
      throw new Error("Could not extract title from file.");
    }
  } catch (error: any) {
    console.error("Error extracting lesson title:", error);
     if (error.toString().includes("RESOURCE_EXHAUSTED") || error.toString().includes("429")) {
        throw new Error("Lỗi giới hạn yêu cầu khi trích xuất tiêu đề.");
    }
    throw new Error("Không thể trích xuất tiêu đề từ tệp.");
  }
};