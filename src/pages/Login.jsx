import React from "react";

const Login = () => {
  const handleLogin = () => {
    window.location.href = "https://backend-production-1f1a.up.railway.app/login";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white bg-black">
      <h1 className="text-3xl font-bold mb-6">🔐 Login to FUT Dashboard</h1>
      <button
        onClick={handleLogin}
        className="bg-[#00ff80] text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition"
      >
        Login with Discord
      </button>
    </div>
  );
};

export default Login;