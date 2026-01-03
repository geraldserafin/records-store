import { A, useNavigate } from "@solidjs/router";
import { authStore } from "./auth.store";
import { Show } from "solid-js";
import { User } from "lucide-solid";

export default function UserMenu() {
  const navigate = useNavigate();

  const handleClick = () => {
    if (authStore.state.user) {
      navigate("/profile");
    } else {
      authStore.login();
    }
  };

  return (
    <button
      onClick={handleClick}
      class="p-0 bg-transparent text-blue-700 underline hover:text-black transition-colors"
    >
      {authStore.state.user ? "Profile" : "Sign in"}
    </button>
  );
}
