
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-8 py-4 border-t">
      <div className="container mx-auto px-4 md:px-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Trợ lý Giáo án AI. Một công cụ hỗ trợ giáo viên Việt Nam.</p>
      </div>
    </footer>
  );
};
