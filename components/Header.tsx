
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <i className="fas fa-brain text-3xl text-blue-500"></i>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
              Trợ lý Giáo án AI
            </span>
          </h1>
        </div>
        <p className="hidden md:block text-sm text-gray-500 italic">Công cụ sáng tạo dành cho nhà giáo dục.</p>
      </div>
    </header>
  );
};
