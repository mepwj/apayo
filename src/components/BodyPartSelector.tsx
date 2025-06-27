import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAppStore } from '../store/useAppStore.js';
import { bodyParts } from '../data/bodyParts.js';
import type { BodyPart } from '../types/index.js';

export default function BodyPartSelector() {
  const { selectBodyPart } = useAppStore();
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParts = bodyParts.filter(part =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.commonSymptoms.some(symptom => 
      symptom.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleBodyPartClick = (part: BodyPart) => {
    selectBodyPart(part);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-soft p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          어디가 불편하신가요?
        </h2>
        <p className="text-gray-600">불편한 부위를 선택하거나 검색해주세요</p>
      </div>

      <div className="mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="부위나 증상을 검색하세요 (예: 머리, 두통)"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-200 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex justify-center items-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8">
          <svg
            width="340"
            height="400"
            viewBox="0 0 340 400"
            className="w-full max-w-sm drop-shadow-lg"
          >
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="stop-color-primary" />
                <stop offset="100%" className="stop-color-secondary" />
              </linearGradient>
            </defs>
            <g>
              {bodyParts.map((part) => (
                <motion.path
                  key={part.id}
                  d={part.path}
                  fill={hoveredPart === part.id ? 'url(#bodyGradient)' : '#F3F4F6'}
                  stroke={hoveredPart === part.id ? '#0FA2E8' : '#D1D5DB'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:drop-shadow-md"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setHoveredPart(part.id)}
                  onMouseLeave={() => setHoveredPart(null)}
                  onClick={() => handleBodyPartClick(part)}
                />
              ))}
            </g>
          </svg>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              빠른 선택
            </h3>
            <span className="text-sm text-gray-500">
              {filteredParts.length}개 부위
            </span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {filteredParts.map((part) => (
              <motion.button
                key={part.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBodyPartClick(part)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  hoveredPart === part.id
                    ? 'border-primary bg-gradient-to-r from-primary/10 to-secondary/10 shadow-soft'
                    : 'border-gray-200 hover:border-primary/30 hover:shadow-soft bg-white'
                }`}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
              >
                <h4 className="font-semibold text-gray-800 text-lg mb-1">{part.name}</h4>
                <p className="text-sm text-gray-600 line-clamp-1">
                  주요 증상: {part.commonSymptoms.slice(0, 3).join(', ')}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}