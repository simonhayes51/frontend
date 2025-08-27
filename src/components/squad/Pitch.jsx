import React from 'react';

export default function Pitch({ children }) {
  return (
    <div className="relative w-full aspect-[3/2] rounded-3xl overflow-hidden shadow-xl border border-neutral-800">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900" />
      <div className="absolute inset-4 border-4 border-white/30 rounded-3xl" />
      <div className="absolute left-1/2 top-4 -translate-x-1/2 w-px h-[calc(100%-2rem)] bg-white/20" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-white/20" />
      {children}
    </div>
  );
}
