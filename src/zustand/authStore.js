import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: null,

  setAuth: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  logout: () => {
    set({ token: null });
    localStorage.removeItem("token");
  },

  checkToken: () => {
    const token = localStorage.getItem("token");
    if (token) {
      set({ token });
    } else {
      set({ token: null });
    }
  },
}));

export default useAuthStore;
