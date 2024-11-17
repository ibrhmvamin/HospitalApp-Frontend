import { create } from "zustand";

// Create Zustand store for authentication
const useAuthStore = create(set => ({
  token: null,

  // Action to set token and user
  setAuth: token => {
    localStorage.setItem("token", token);
    set({ token });
  },

  // Action to clear authentication (logout)
  logout: () => {
    set({ token: null });
    localStorage.removeItem("token");
  },
  // Action to check if the token is present in the local storage
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
