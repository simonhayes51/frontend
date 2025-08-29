// src/pages/AuthDone.jsx
import { useEffect, useState } from "react";
import api from "../axios";

export default function AuthDone() {
  const [msg, setMsg] = useState("Authorising…");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/me"); // withCredentials is true in axios.js
        if (data?.authenticated) {
          localStorage.setItem("user_id", data.user_id);
          localStorage.setItem("user_name", data.global_name || data.username || "");
          window.location.replace("/#/"); // HashRouter root
          return;
        }
      } catch {}
      setMsg("Couldn't confirm login. Click to try again.");
    })();
  }, []);

  return (
    <div className="p-8 flex flex-col items-center gap-4">
      <div>{msg}</div>
      <a
        className="px-4 py-2 rounded-xl bg-lime-500 text-black"
        href={`${import.meta.env.VITE_API_URL}/api/login`}
      >
        Continue with Discord
      </a>
    </div>
  );
}
