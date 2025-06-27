import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle, Loader2, Search } from 'lucide-react';
import { useAppStore } from '../store/useAppStore.js';
import { symptoms } from '../data/symptoms.js';
import { analyzeSymptoms } from '../services/openai.js';

export default function SymptomSelector() {
  const { 
    selectedBodyPart, 
    selectedSymptoms, 
    symptomSeverity,
    toggleSymptom, 
    setSeverity,
    setStep,
    setAnalysisResult
  } = useAppStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const relevantSymptoms = symptoms.filter(symptom => 
    selectedBodyPart && symptom.bodyParts.includes(selectedBodyPart.id)
  );

  const filteredSymptoms = relevantSymptoms.filter(symptom =>
    symptom.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = async () => {
    if (selectedSymptoms.length === 0) {
      alert('최소 1개 이상의 증상을 선택해주세요.');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeSymptoms({
        bodyPart: selectedBodyPart!.name,
        symptoms: selectedSymptoms.map(s => s.name),
        severity: symptomSeverity
      });
      
      setAnalysisResult(result.predictions);
    } catch (error) {
      console.error('증상 분석 오류:', error);
      alert('증상 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-soft p-8"
    >
      <div className="mb-8">
        <button
          onClick={() => setStep(1)}
          className="mb-4 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-soft inline-flex items-center gap-2 text-gray-600"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">이전으로</span>
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {selectedBodyPart?.name}의 어떤 증상이 있나요?
          </h2>
          <p className="text-gray-600">해당하는 증상을 모두 선택해주세요</p>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="증상을 검색하세요"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {filteredSymptoms.length}개의 증상이 있습니다
        </p>
      </div>

      {/* 증상 목록 - 스크롤 가능 */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar mb-8 p-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSymptoms.map((symptom) => {
          const isSelected = selectedSymptoms.some(s => s.id === symptom.id);
          
          return (
            <motion.button
              key={symptom.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSymptom(symptom)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'border-primary-600 bg-gradient-to-br from-primary-100 to-secondary-100 shadow-md ring-2 ring-primary-400/30'
                  : 'border-gray-200 hover:border-primary/30 hover:shadow-soft bg-white'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="text-2xl mb-2">{symptom.icon}</div>
              <p className="text-xs font-semibold text-gray-800">{symptom.name}</p>
            </motion.button>
          );
        })}
        </div>
      </div>

      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <label className="block text-lg font-semibold text-gray-800 mb-4">
          증상의 심각도를 선택해주세요
        </label>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 w-16">경미</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="1"
                max="10"
                value={symptomSeverity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-lg pointer-events-none opacity-30" />
            </div>
            <span className="text-sm text-gray-600 w-16 text-right">심각</span>
          </div>
          <div className="text-center">
            <span className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${
              symptomSeverity <= 3 ? 'bg-green-100 text-green-700' :
              symptomSeverity <= 6 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {symptomSeverity}/10
            </span>
          </div>
        </div>
      </div>

      {symptomSeverity >= 8 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl flex items-center shadow-soft"
        >
          <div className="p-2 bg-red-100 rounded-full mr-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-800 mb-1">주의가 필요합니다</p>
            <p className="text-sm text-red-700">
              증상이 심각한 수준입니다. 빠른 시일 내에 의료진 상담을 받으시기 바랍니다.
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-sm font-semibold text-primary">
              {selectedSymptoms.length}개 선택됨
            </span>
          </div>
          {selectedSymptoms.length > 0 && (
            <button
              onClick={() => selectedSymptoms.forEach(s => toggleSymptom(s))}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              모두 해제
            </button>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={selectedSymptoms.length === 0 || isAnalyzing}
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
            selectedSymptoms.length > 0 && !isAnalyzing
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-medium transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI가 증상을 분석하고 있습니다...
            </>
          ) : (
            <>
              증상 분석하기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}