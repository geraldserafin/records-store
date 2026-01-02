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
      class="text-black hover:text-gray-600 transition-colors p-2"
      title={authStore.state.user ? "Account" : "Login"}
    >
      <User size={20} />
    </button>
  );
}
