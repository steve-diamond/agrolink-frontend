import React from 'react';
import { GRADING_STANDARDS, Grade } from '../../lib/grading-standards';
import { ShieldCheckIcon, StarIcon } from '@heroicons/react/24/solid';

interface GradeBadgeProps {
  grade: Grade | 'U';
  commodity: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const sizeMap = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-12 w-12 text-base',
};

const colorMap = {
  A: 'bg-green-500 text-white',
  B: 'bg-yellow-400 text-white',
  C: 'bg-orange-400 text-white',
  U: 'bg-gray-300 text-gray-700',
};

const labelMap = {
  A: 'Premium Quality',
  B: 'Standard Quality',
  C: 'Processing Grade',
  U: 'No Grade',
};

const iconMap = {
  A: <StarIcon className="h-4 w-4 inline ml-1 text-white" />, // Star for A
  B: null,
  C: null,
  U: null,
};

export const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, commodity, size = 'md', onClick }) => {
  const badgeColor = colorMap[grade] || colorMap.U;
  const badgeLabel = labelMap[grade] || labelMap.U;
  const icon = iconMap[grade];
  return (
    <button
      type="button"
      className={`inline-flex items-center rounded-full px-3 py-1 font-semibold shadow ${badgeColor} ${sizeMap[size]}`}
      onClick={onClick}
      title={badgeLabel}
    >
      <ShieldCheckIcon className="h-4 w-4 mr-1" />
      {badgeLabel}
      {icon}
    </button>
  );
};

// Modal for full criteria (to be used in parent)
export const GradeCriteriaModal: React.FC<{
  open: boolean;
  onClose: () => void;
  commodity: string;
  grade: Grade;
}> = ({ open, onClose, commodity, grade }) => {
  if (!open) return null;
  const standard = GRADING_STANDARDS[commodity]?.[grade];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-2">{commodity} - Grade {grade}: {standard?.label}</h2>
        <ul className="list-disc ml-5 mb-4">
          {standard?.criteria.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
        <button className="mt-2 px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
