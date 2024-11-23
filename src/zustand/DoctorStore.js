import { create } from "zustand";

const useDoctorStore = create((set) => ({
  selectedDoctor: null,
  setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),
}));

export default useDoctorStore;
