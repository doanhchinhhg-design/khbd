import React, { useState, useEffect } from 'react';
import type { Part } from '@google/genai';
import type { LessonPlanFormData } from '../types';
import { GRADES, SUBJECTS } from '../constants';
import { extractLessonTitleFromFile } from '../services/geminiService';

// Khai báo các thư viện toàn cục từ CDN
declare const mammoth: {
  extractRawText: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};
declare const XLSX: any;

interface LessonPlanFormProps {
  onGenerate: (formData: LessonPlanFormData, modificationPrompt: string, processedParts: Part[]) => void;
  isLoading: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            resolve(result);
        };
        reader.onerror = error => reject(error);
    });
};

const processFile = async (file: File): Promise<Part | null> => {
    const mimeType = file.type;
    const fileName = file.name;

    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
        const data = await fileToBase64(file);
        return { inlineData: { mimeType, data } };
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // .docx
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return { text: `Nội dung từ tệp Word "${fileName}":\n\n${result.value}` };
        } catch (error) {
            console.error(`Error processing docx file ${fileName}:`, error);
            alert(`Không thể đọc nội dung từ tệp Word "${fileName}". Tệp có thể bị lỗi.`);
            return null;
        }
    }
    
    if (mimeType.includes('spreadsheetml') || mimeType.includes('ms-excel')) { // .xlsx, .xls
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
            let fullText = '';
            workbook.SheetNames.forEach((sheetName: string) => {
                const worksheet = workbook.Sheets[sheetName];
                const sheetText = XLSX.utils.sheet_to_txt(worksheet);
                fullText += `Trang tính: ${sheetName}\n\n${sheetText}\n\n---\n\n`;
            });
            return { text: `Nội dung từ tệp Excel "${fileName}":\n\n${fullText}` };
        } catch (error) {
             console.error(`Error processing excel file ${fileName}:`, error);
            alert(`Không thể đọc nội dung từ tệp Excel "${fileName}". Tệp có thể bị lỗi.`);
            return null;
        }
    }
    
    alert(`Định dạng tệp "${fileName}" (${mimeType}) không được hỗ trợ. Tệp này sẽ được bỏ qua.`);
    console.warn(`Unsupported file type: ${mimeType}. Skipping file ${fileName}.`);
    return null;
};


export const LessonPlanForm: React.FC<LessonPlanFormProps> = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState<LessonPlanFormData>({
    educationLevel: 'Tiểu học',
    grade: '1',
    subject: SUBJECTS['Tiểu học'][0],
    lessonTitle: '',
    duration: 1,
    classCharacteristics: '',
    lessonPlanTemplate: '5512',
  });
  
  const [textbookFile, setTextbookFile] = useState<File | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<FileList | null>(null);
  const [isExtractingTitle, setIsExtractingTitle] = useState<boolean>(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      grade: GRADES[prev.educationLevel][0],
      subject: SUBJECTS[prev.educationLevel][0],
    }));
  }, [formData.educationLevel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = Math.max(1, parseInt(e.target.value, 10) || 1);
     setFormData((prev) => ({ ...prev, duration: value }));
  };

  const handleTextbookFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setTextbookFile(file);

    if (!file) return;

    setIsExtractingTitle(true);
    setFormData(prev => ({ ...prev, lessonTitle: '' }));
    try {
      const processedPart = await processFile(file);
      if (processedPart) {
        const extractedTitle = await extractLessonTitleFromFile(processedPart);
        setFormData(prev => ({ ...prev, lessonTitle: extractedTitle }));
      }
    } catch (error) {
      console.error("Failed to auto-fill lesson title:", error);
      alert(error instanceof Error ? error.message : "Lỗi không xác định khi trích xuất tiêu đề.");
    } finally {
      setIsExtractingTitle(false);
    }
  };

  const handleReferenceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setReferenceFiles(files);
  };

  const handleSubmit = async (modificationPrompt: string = '') => {
    if (!formData.subject.trim() || !formData.lessonTitle.trim()) {
      alert('Vui lòng nhập Môn học và Tên bài học.');
      return;
    }
    
    const filesToProcess: File[] = [];
    if (textbookFile) filesToProcess.push(textbookFile);
    if (referenceFiles) {
      for (let i = 0; i < referenceFiles.length; i++) {
        const file = referenceFiles.item(i);
        if (file) {
          filesToProcess.push(file);
        }
      }
    }

    const processedParts: Part[] = [];
    try {
        const results = await Promise.all(filesToProcess.map(processFile));
        results.forEach(part => {
            if (part) processedParts.push(part);
        });
    } catch (error) {
        console.error("Error processing files:", error);
        alert('Đã xảy ra lỗi khi xử lý tệp đính kèm.');
        return;
    }

    onGenerate(formData, modificationPrompt, processedParts);
  };

  const modificationPrompts = {
    autoTechniques: "YÊU CẦU BỔ SUNG: Dựa vào môn học, lớp học và mục tiêu bài học, hãy tự động đề xuất các kĩ thuật dạy học tích cực phù hợp nhất cho từng hoạt động trong kế hoạch bài dạy.",
    forDisadvantaged: "YÊU CẦU BỔ SUNG: Điều chỉnh kế hoạch bài dạy theo hướng phù hợp với học sinh vùng đặc biệt khó khăn: sử dụng ngôn ngữ đơn giản, hoạt động rõ ràng, giảm yêu cầu trừu tượng, tăng cường hỗ trợ trực quan và các ví dụ gần gũi với đời sống các em.",
  }
  
  const acceptedFileTypes = "application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200/80 sticky top-24">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Thông tin bài dạy</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-600 mb-1">Cấp học</label>
              <select id="educationLevel" name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ease-in-out">
                <option value="Tiểu học">Tiểu học</option>
                <option value="THCS">Trung học cơ sở</option>
              </select>
            </div>
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-600 mb-1">Lớp</label>
              <select id="grade" name="grade" value={formData.grade} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ease-in-out">
                {GRADES[formData.educationLevel].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
        </div>

        <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-600 mb-1">Môn học (*)</label>
            <select id="subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ease-in-out">
            {SUBJECTS[formData.educationLevel].map((s) => (
                <option key={s} value={s}>{s}</option>
            ))}
            </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div className="relative col-span-2 sm:col-span-1">
              <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-600 mb-1">Tên bài học (*)</label>
              <input 
                type="text" 
                id="lessonTitle" 
                name="lessonTitle" 
                value={formData.lessonTitle} 
                onChange={handleChange} 
                placeholder={isExtractingTitle ? "Đang nhận diện..." : "VD: Sơn Tinh, Thủy Tinh"}
                required 
                disabled={isExtractingTitle}
                className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ease-in-out disabled:bg-gray-100" 
              />
              {isExtractingTitle && (
                <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
              )}
            </div>
             <div className="col-span-2 sm:col-span-1">
              <label htmlFor="duration" className="block text-sm font-medium text-gray-600 mb-1">Số tiết (*)</label>
              <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleDurationChange} min="1" required className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ease-in-out" />
            </div>
        </div>
        
        <div>
          <label htmlFor="lessonPlanTemplate" className="block text-sm font-medium text-gray-600 mb-1">Mẫu giáo án</label>
          <select id="lessonPlanTemplate" name="lessonPlanTemplate" value={formData.lessonPlanTemplate} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ease-in-out">
            <option value="5512">Theo Công văn 5512 (Mặc định)</option>
            <option value="2345">Theo Công văn 2345</option>
          </select>
        </div>

        <div>
          <label htmlFor="textbookFile" className="block text-sm font-medium text-gray-600 mb-1">Tải trang SGK (PDF, ảnh, Word...)</label>
          <input 
              type="file" 
              id="textbookFile" 
              name="textbookFile" 
              onChange={handleTextbookFileChange} 
              accept={acceptedFileTypes} 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 file:cursor-pointer transition-colors duration-300" />
        </div>
        
        <div>
            <label htmlFor="referenceFiles" className="block text-sm font-medium text-gray-600 mb-1">Tải tài liệu tham khảo (Word, PDF...)</label>
            <input 
                type="file" 
                id="referenceFiles" 
                name="referenceFiles" 
                multiple 
                onChange={handleReferenceFilesChange}
                accept={acceptedFileTypes} 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer transition-colors duration-300" />
        </div>
        
        <div>
          <label htmlFor="classCharacteristics" className="block text-sm font-medium text-gray-600 mb-1">Đặc điểm lớp học (nếu có)</label>
          <textarea id="classCharacteristics" name="classCharacteristics" value={formData.classCharacteristics} onChange={handleChange} rows={2} placeholder="VD: Vùng khó khăn, HS yếu-khá-giỏi,..." className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ease-in-out"></textarea>
        </div>

        <div className="pt-4 space-y-3">
          <button type="button" onClick={() => handleSubmit()} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center">
            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
            {isLoading ? 'Đang soạn giáo án...' : 'Tạo giáo án'}
          </button>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button type="button" onClick={() => handleSubmit(modificationPrompts.autoTechniques)} disabled={isLoading} className="w-full bg-green-50 text-green-700 font-semibold py-2 px-2 rounded-lg hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-300">
              <i className="fa-solid fa-star mr-1"></i>
              Tự chọn kĩ thuật
            </button>
            <button type="button" onClick={() => handleSubmit(modificationPrompts.forDisadvantaged)} disabled={isLoading} className="w-full bg-orange-50 text-orange-700 font-semibold py-2 px-2 rounded-lg hover:bg-orange-100 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-300">
              <i className="fa-solid fa-heart mr-1"></i>
              Dành cho vùng khó
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};