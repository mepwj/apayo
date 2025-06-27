import { motion } from 'framer-motion';
import { AlertTriangle, Info, MapPin, ChevronLeft, Activity, Stethoscope, Heart, Brain } from 'lucide-react';
import { useAppStore } from '../store/useAppStore.js';

export default function AnalysisResult() {
  const { analysisResult, setStep, symptomSeverity } = useAppStore();

  if (!analysisResult || analysisResult.length === 0) {
    return null;
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'text-red-700 bg-gradient-to-r from-red-100 to-red-50 border-red-300';
      case 'urgent': return 'text-orange-700 bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300';
      default: return 'text-green-700 bg-gradient-to-r from-green-100 to-green-50 border-green-300';
    }
  };
  
  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'urgent': return <Activity className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return '응급';
      case 'urgent': return '긴급';
      default: return '일반';
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
          onClick={() => setStep(2)}
          className="mb-4 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-soft inline-flex items-center gap-2 text-gray-600"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">이전으로</span>
        </button>
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl mb-4">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            AI 증상 분석 결과
          </h2>
          <p className="text-gray-600">입력하신 증상에 대한 분석 결과입니다</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`mb-8 p-5 rounded-xl border-2 ${
          import.meta.env.DEV 
            ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
            : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
        }`}
      >
        <div className="flex items-start">
          <div className={`p-2 rounded-full mr-4 ${
            import.meta.env.DEV 
              ? 'bg-orange-100'
              : 'bg-blue-100'
          }`}>
            <Info className={`w-5 h-5 ${
              import.meta.env.DEV 
                ? 'text-orange-600'
                : 'text-blue-600'
            }`} />
          </div>
          <div>
            <p className={`font-semibold mb-1 ${
              import.meta.env.DEV 
                ? 'text-orange-800'
                : 'text-blue-800'
            }`}>
              {import.meta.env.DEV ? '개발 환경 안내' : '중요 안내'}
            </p>
            <p className={`text-sm ${
              import.meta.env.DEV 
                ? 'text-orange-700'
                : 'text-blue-700'
            }`}>
              {import.meta.env.DEV 
                ? '현재 개발 환경에서 목업 데이터를 사용 중입니다. 실제 AI 분석은 배포 후 이용 가능합니다.'
                : '이 결과는 AI 기반 예측이며, 실제 진단은 반드시 의료진과 상담하시기 바랍니다.'
              }
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4 mb-8">
        {analysisResult.map((disease, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary/30 hover:shadow-medium transition-all duration-200 bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {disease.name}
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${getUrgencyColor(disease.urgency)}`}>
                    {getUrgencyIcon(disease.urgency)}
                    {getUrgencyText(disease.urgency)}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${disease.probability * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 ml-2">
                      {Math.round(disease.probability * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-20 h-20 relative">
                  <svg className="transform -rotate-90 w-20 h-20">
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#F3F4F6"
                      strokeWidth="10"
                      fill="none"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#3b82f6"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 35}
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - disease.probability) }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
                    {Math.round(disease.probability * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            {disease.description && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {disease.description}
              </p>
            )}
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">추천 진료과</p>
              <div className="flex flex-wrap gap-2">
                {disease.specialists.map((specialist, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary-700 rounded-full text-sm font-medium"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    {specialist}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {symptomSeverity >= 8 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl shadow-soft"
        >
          <div className="flex items-start">
            <div className="p-3 bg-red-100 rounded-full mr-4 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-red-800 mb-2">긴급 상황일 수 있습니다</p>
              <p className="text-sm text-red-700 mb-3">
                증상이 심각하다면 즉시 응급실을 방문하거나 119에 연락하세요.
              </p>
              <a
                href="tel:119"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                119 응급전화
              </a>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{analysisResult.length}개</span>의 가능한 질환을 발견했습니다
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep(4)}
          className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-large transition-all duration-200 flex items-center gap-3 transform hover:-translate-y-0.5"
        >
          <MapPin className="w-5 h-5" />
          근처 병원 찾기
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}