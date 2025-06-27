import type { BodyPart } from '../types/index.js';

export const bodyParts: BodyPart[] = [
  {
    id: 'head',
    name: '머리',
    path: 'M 150 30 Q 150 10, 170 10 Q 190 10, 190 30 L 190 50 Q 190 70, 170 70 Q 150 70, 150 50 Z',
    commonSymptoms: ['두통', '어지러움', '발열', '편두통']
  },
  {
    id: 'neck',
    name: '목',
    path: 'M 160 70 L 160 90 Q 160 100, 170 100 Q 180 100, 180 90 L 180 70',
    commonSymptoms: ['목 통증', '인후통', '목 부음', '삼킴 곤란']
  },
  {
    id: 'chest',
    name: '가슴',
    path: 'M 140 100 Q 140 90, 150 90 L 190 90 Q 200 90, 200 100 L 200 140 Q 200 150, 190 150 L 150 150 Q 140 150, 140 140 Z',
    commonSymptoms: ['가슴 통증', '호흡곤란', '기침', '가래']
  },
  {
    id: 'abdomen',
    name: '복부',
    path: 'M 140 150 L 200 150 L 200 200 Q 200 210, 190 210 L 150 210 Q 140 210, 140 200 Z',
    commonSymptoms: ['복통', '소화불량', '구토', '설사']
  },
  {
    id: 'leftArm',
    name: '왼팔',
    path: 'M 140 100 L 120 110 Q 110 115, 105 125 L 90 180 Q 88 190, 95 195 L 100 200',
    commonSymptoms: ['팔 통증', '저림', '근육통', '관절통']
  },
  {
    id: 'rightArm',
    name: '오른팔',
    path: 'M 200 100 L 220 110 Q 230 115, 235 125 L 250 180 Q 252 190, 245 195 L 240 200',
    commonSymptoms: ['팔 통증', '저림', '근육통', '관절통']
  },
  {
    id: 'leftLeg',
    name: '왼쪽 다리',
    path: 'M 155 210 L 150 250 L 145 300 Q 143 310, 148 315 L 150 320',
    commonSymptoms: ['다리 통증', '저림', '부종', '경련']
  },
  {
    id: 'rightLeg',
    name: '오른쪽 다리',
    path: 'M 185 210 L 190 250 L 195 300 Q 197 310, 192 315 L 190 320',
    commonSymptoms: ['다리 통증', '저림', '부종', '경련']
  },
  {
    id: 'back',
    name: '등/허리',
    path: 'M 140 120 L 200 120 M 140 170 L 200 170',
    commonSymptoms: ['요통', '등 통증', '디스크', '근육통']
  }
];