
import React, { useState, useCallback } from 'react';
import type { Part } from '@google/genai';
import { LessonPlanForm } from './components/LessonPlanForm';
import { LessonPlanDisplay } from './components/LessonPlanDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { LessonPlanFormData } from './types';
import { generateLessonPlan } from './services/geminiService';

const App: React.FC = () => {
  const [lessonPlan, setLessonPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>('');

  const handleGeneratePlan = useCallback(async (formData: LessonPlanFormData, modificationPrompt: string, processedParts: Part[]) => {
    setIsLoading(true);
    setError(null);
    setLessonPlan('');
    setLessonTitle(formData.lessonTitle);
    try {
      const stream = generateLessonPlan(formData, modificationPrompt, processedParts);
      for await (const chunk of stream) {
        setLessonPlan((prev) => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <LessonPlanForm onGenerate={handleGeneratePlan} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <LessonPlanDisplay lessonPlan={lessonPlan} isLoading={isLoading} error={error} lessonTitle={lessonTitle} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;