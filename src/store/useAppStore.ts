import { create } from 'zustand';
import type { BodyPart, Symptom, Disease, Hospital } from '../types/index.js';

interface AppState {
  currentStep: number;
  selectedBodyPart: BodyPart | null;
  selectedSymptoms: Symptom[];
  symptomSeverity: number;
  analysisResult: Disease[] | null;
  nearbyHospitals: Hospital[];
  
  setStep: (step: number) => void;
  selectBodyPart: (bodyPart: BodyPart) => void;
  toggleSymptom: (symptom: Symptom) => void;
  setSeverity: (severity: number) => void;
  setAnalysisResult: (result: Disease[]) => void;
  setNearbyHospitals: (hospitals: Hospital[]) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentStep: 1,
  selectedBodyPart: null,
  selectedSymptoms: [],
  symptomSeverity: 5,
  analysisResult: null,
  nearbyHospitals: [],
  
  setStep: (step) => set({ currentStep: step }),
  
  selectBodyPart: (bodyPart) => set({ 
    selectedBodyPart: bodyPart,
    selectedSymptoms: [],
    currentStep: 2
  }),
  
  toggleSymptom: (symptom) => set((state) => {
    const exists = state.selectedSymptoms.find(s => s.id === symptom.id);
    if (exists) {
      return {
        selectedSymptoms: state.selectedSymptoms.filter(s => s.id !== symptom.id)
      };
    }
    return {
      selectedSymptoms: [...state.selectedSymptoms, symptom]
    };
  }),
  
  setSeverity: (severity) => set({ symptomSeverity: severity }),
  
  setAnalysisResult: (result) => set({ 
    analysisResult: result,
    currentStep: 3
  }),
  
  setNearbyHospitals: (hospitals) => set({ nearbyHospitals: hospitals }),
  
  reset: () => set({
    currentStep: 1,
    selectedBodyPart: null,
    selectedSymptoms: [],
    symptomSeverity: 5,
    analysisResult: null,
    nearbyHospitals: []
  })
}));