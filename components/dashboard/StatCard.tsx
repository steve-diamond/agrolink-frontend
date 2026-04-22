import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl shadow-md flex flex-col items-center justify-center p-6 min-w-[140px]">
    {icon && <div className={`text-3xl mb-2 ${color || ''}`}>{icon}</div>}
    <div className="text-2xl font-bold mb-1" style={color ? { color } : {}}>{value}</div>
    <div className="text-gray-500 text-sm font-medium text-center">{label}</div>
  </div>
);

export default StatCard;
