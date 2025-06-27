import { useAppStore } from '../store/useAppStore.js';
import BodyPartSelector from '../components/BodyPartSelector.js';
import SymptomSelector from '../components/SymptomSelector.js';
import AnalysisResult from '../components/AnalysisResult.js';
import HospitalFinder from '../components/HospitalFinder.js';
import StepIndicator from '../components/StepIndicator.js';
import Logo from '../components/Logo.js';
import { Shield, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { currentStep, reset } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={reset}
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Logo size="lg" className="shadow-soft" />
              <div className="text-left">
                <h1 className="text-2xl font-display font-bold text-gray-800">아파요 (APAYO)</h1>
                <p className="text-xs text-gray-600 -mt-1">AI 의료 증상 분석 서비스</p>
              </div>
            </motion.button>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center space-x-6"
            >
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-primary-600" />
                <span>안전한 의료 정보</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-secondary-600" />
                <span>24시간 이용 가능</span>
              </div>
              <button className="flex items-center space-x-2 btn-primary text-sm">
                <Phone className="w-4 h-4" />
                <span>응급전화 119</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 상단 안내 메시지 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-display font-bold text-gray-800 mb-2">
            3클릭으로 찾는 내 증상, 내 병원
          </h2>
          <p className="text-gray-600">
            AI가 증상을 분석하고 가장 적합한 병원을 추천해드립니다
          </p>
        </motion.div>

        {/* 스텝 인디케이터 */}
        <div className="mb-12">
          <StepIndicator />
        </div>
        
        {/* 단계별 컨텐츠 */}
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[500px]"
        >
          {currentStep === 1 && <BodyPartSelector />}
          {currentStep === 2 && <SymptomSelector />}
          {currentStep === 3 && <AnalysisResult />}
          {currentStep === 4 && <HospitalFinder />}
        </motion.div>

      </main>

      {/* 푸터 */}
      <footer className="mt-20 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              이 서비스는 의료 정보 제공을 목적으로 하며, 실제 진단은 의료진과 상담하시기 바랍니다.
            </p>
            <p>© 2024 APAYO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}