import { createStore } from "solid-js/store";
import { api } from "../../lib/api";

const [auth, setAuth] = createStore({
  user: null,
  loading: true,
  error: null,
});

export const authStore = {
  state: auth,
  
  async check() {
    setAuth("loading", true);
    console.log("Checking auth status...");
    try {
      const user = await api.get("users/me").json();
      console.log("Auth success:", user);
      setAuth("user", user);
    } catch (err) {
      console.error("Auth check failed:", err);
      setAuth("user", null);
      // Don't show error for 401/403 as it just means not logged in
      if (err.response?.status !== 403 && err.response?.status !== 401) {
        setAuth("error", err.message);
      }
    } finally {
      setAuth("loading", false);
    }
  },

  login() {
    // External redirect required to start OAuth flow
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },

  async logout() {
    try {
      await api.get("auth/logout");
      setAuth("user", null);
      return true;
    } catch (err) {
      console.error("Logout failed", err);
      return false;
    }
  }
};
