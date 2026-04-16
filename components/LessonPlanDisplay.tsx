
import React, { useRef, useEffect, useState } from 'react';

interface LessonPlanDisplayProps {
  lessonPlan: string;
  isLoading: boolean;
  error: string | null;
  lessonTitle: string;
}

// Declaring libs from CDN
declare const marked: {
  parse: (markdown: string) => string;
};
declare const htmlDocx: {
  asBlob: (html: string, options?: object) => Blob;
};
declare const saveAs: (blob: Blob, filename: string) => void;


const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center text-gray-500">
        <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-semibold text-lg text-gray-600">AI đang làm việc, vui lòng chờ trong giây lát...</p>
        <p className="text-sm mt-1">Quá trình này có thể mất đến 30 giây để hoàn thành.</p>
    </div>
);

const WelcomeMessage: React.FC = () => (
    <div className="text-center text-gray-500">
        <div className="text-6xl mb-4 text-blue-400"><i className="fa-regular fa-file-lines"></i></div>
        <h3 className="text-2xl font-bold text-gray-700">Trợ lý Soạn thảo Giáo án</h3>
        <p className="mt-2 max-w-md mx-auto">Điền thông tin vào biểu mẫu, tải lên tài liệu và để AI giúp bạn tạo một kế hoạch bài dạy chi tiết, chuyên nghiệp!</p>
    </div>
);


export const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ lessonPlan, isLoading, error, lessonTitle }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (lessonPlan && contentRef.current) {
        const htmlContent = marked.parse(lessonPlan);
        contentRef.current.innerHTML = htmlContent;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }
  }, [lessonPlan]);

  const handleCopy = () => {
    if (lessonPlan) {
        navigator.clipboard.writeText(lessonPlan).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }
  };

  const handleExportWord = () => {
    if (!lessonPlan) return;

    const headerHtml = `
      <table style="width: 100%; border: none; font-size: 13pt; font-family: 'Times New Roman', Times, serif;">
          <tr style="border: none;">
              <td style="text-align: center; border: none; vertical-align: top; width: 50%;">
                  <p style="margin: 0; padding: 0; text-transform: uppercase;"><strong>SỞ GIÁO DỤC VÀ ĐÀO TẠO ...</strong></p>
                  <p style="margin: 0; padding: 0; text-transform: uppercase;"><strong>TRƯỜNG ...</strong></p>
                  <hr style="width: 50%; border-top: 1px solid black;"/>
              </td>
              <td style="text-align: center; border: none; vertical-align: top; width: 50%;">
                  <p style="margin: 0; padding: 0;"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
                  <p style="margin: 0; padding: 0;"><strong>Độc lập - Tự do - Hạnh phúc</strong></p>
                  <hr style="width: 50%; border-top: 1px solid black;"/>
              </td>
          </tr>
      </table>
      <br/>
      <div style="text-align: center;">
          <h1 style="font-size: 14pt; margin: 0; padding: 0;"><strong>KẾ HOẠCH BÀI DẠY</strong></h1>
          <h2 style="font-size: 14pt; margin: 0; padding: 0;"><strong>(GIÁO ÁN)</strong></h2>
          <br/>
      </div>
    `;
    
    const contentHtml = marked.parse(lessonPlan);
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body, table, p, li, h1, h2, h3 { 
              font-family: 'Times New Roman', Times, serif; 
              font-size: 13pt; 
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid black;
              padding: 5px;
            }
          </style>
        </head>
        <body>
          ${headerHtml}
          ${contentHtml}
        </body>
      </html>
    `;
    
    const blob = htmlDocx.asBlob(fullHtml, {
      orientation: 'portrait',
      margins: { top: 720, right: 720, bottom: 720, left: 720 } // 1 inch margins
    });
    const safeFilename = lessonTitle.trim().replace(/[^a-z0-9_.]/gi, '_').toLowerCase();
    saveAs(blob, `giao_an_${safeFilename}.docx`);
  };

  const renderContent = () => {
    if (isLoading && !lessonPlan) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="font-bold text-lg"><i className="fa-solid fa-circle-exclamation mr-2"></i>Đã xảy ra lỗi</h3>
        <p>{error}</p>
      </div>;
    }
    if (lessonPlan || isLoading) {
      return (
        <div className="w-full">
            <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                    onClick={handleCopy} 
                    disabled={isLoading}
                    className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 shadow-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
                    aria-label="Copy lesson plan text"
                >
                    {/* FIX: Use template literal (backticks) for className to enable string interpolation. */}
                    {/* The className was using single quotes instead of backticks, which prevented the template literal from being parsed correctly. This has been fixed. */}
                    <i className={`fa-solid ${isCopied ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                    <span className="ml-2">{isCopied ? 'Đã chép!' : 'Chép'}</span>
                </button>
                <button 
                    onClick={handleExportWord} 
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 shadow-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                    aria-label="Export lesson plan to Word document"
                >
                    <i className="fa-solid fa-file-word"></i>
                    <span className="ml-2">Xuất Word</span>
                </button>
            </div>
            <div ref={contentRef} className="prose prose-sm sm:prose-base max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h1:text-blue-600 prose-h2:text-blue-500 prose-h2:border-b prose-h2:border-blue-200 prose-h2:pb-2 prose-h2:mt-6 prose-h2:mb-3 prose-table:border prose-table:border-gray-200 prose-th:bg-blue-100/70 prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-gray-200"></div>
            {isLoading && (
              <div className="flex items-center justify-center mt-6 text-gray-500">
                  <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                  </svg>
                  <span>AI đang viết tiếp...</span>
              </div>
            )}
        </div>
      );
    }
    return <WelcomeMessage />;
  };

  return (
    <div ref={scrollContainerRef} className="bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-lg min-h-[600px] relative border border-gray-200/80 transition-all duration-500 overflow-y-auto flex items-center justify-center">
      {renderContent()}
    </div>
  );
};
