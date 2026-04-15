import React from "react";

export default function DosAgrolinkHeader() {
  return (
    <header className="flex items-center justify-between w-full px-8 py-6 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        {/* Logo placeholder */}
        <div className="w-14 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center">
          {/* You can replace this with an <img src="/logo.png" ... /> */}
        </div>
        <span className="text-2xl font-extrabold text-green-900 tracking-tight">DOS AGROLINK</span>
      </div>
      <div className="flex flex-col items-start max-w-xl ml-8">
        <span className="text-lg font-semibold text-green-800 mb-1">Empowering Africa’s Agriculture, One Link at a Time</span>
        <span className="text-sm text-gray-700 mb-1">Connecting farmers, buyers, and innovators for a sustainable, tech-driven agri-ecosystem.</span>
        <span className="text-xs text-gray-500">Transparency | Innovation | Community | Growth</span>
      </div>
    </header>
  );
}
