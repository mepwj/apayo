import { useAppStore } from '../store/useAppStore.js';
import { Check, MapPin, Heart, FileText, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { id: 1, name: '부위 선택', description: '어디가 불편하신가요?', icon: Heart },
  { id: 2, name: '증상 선택', description: '어떤 증상이 있나요?', icon: FileText },
  { id: 3, name: '결과 확인', description: '이런 가능성이 있어요', icon: Search },
  { id: 4, name: '병원 찾기', description: '근처 병원을 찾았어요', icon: MapPin },
];

export default function StepIndicator() {
  const { currentStep } = useAppStore();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative max-w-3xl mx-auto">
        {/* 진행 바 배경 */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full -z-10" />
        
        {/* 진행 바 */}
        <motion.div 
          className="absolute top-8 left-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full -z-10"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isPending = step.id > currentStep;
          
          return (
            <motion.div 
              key={step.id} 
              className="flex flex-col items-center flex-1 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                {/* 광선 효과 */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary-400 blur-xl opacity-50"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    backgroundColor: isCompleted ? '#10b981' : isActive ? '#3b82f6' : '#e5e7eb',
                    boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
                  }}
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center relative z-10
                    ${isCompleted ? 'bg-accent-500' : isActive ? 'bg-primary-500' : 'bg-gray-200'}
                    ${isActive ? 'shadow-glow' : isPending ? '' : 'shadow-soft'}
                    transition-all duration-300
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  ) : (
                    <Icon className={`w-7 h-7 ${isPending ? 'text-gray-400' : 'text-white'}`} />
                  )}
                </motion.div>
              </motion.div>
              
              <div className="mt-3 text-center">
                <p className={`text-sm font-semibold transition-colors ${
                  isActive ? 'text-primary-600' : isCompleted ? 'text-accent-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className={`text-xs mt-0.5 transition-colors ${
                  isActive ? 'text-primary-500' : 'text-gray-400'
                } hidden sm:block`}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}