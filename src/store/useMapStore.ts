import { create } from 'zustand';

interface MapState {
  drawCoords: any[];
  uploadedFeatures: any[];
  setDrawCoords: (coords: any[]) => void;
  setUploadedFeatures: (features: any[]) => void;
}

export const useMapStore = create<MapState>((set) => ({
  drawCoords: [],
  uploadedFeatures: [],
  setDrawCoords: (coords) => set({ drawCoords: coords }),
  setUploadedFeatures: (features) => set({ uploadedFeatures: features }),
}));
