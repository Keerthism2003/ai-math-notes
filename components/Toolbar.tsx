
import React from 'react';
import { ClearIcon } from './icons/ClearIcon';
import { SolveIcon } from './icons/SolveIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface ToolbarProps {
  onSolve: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onSolve, onClear, isLoading }) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        onClick={onClear}
        disabled={isLoading}
        className="flex items-center justify-center w-32 h-14 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      >
        <ClearIcon className="w-6 h-6 mr-2" />
        Clear
      </button>
      <button
        onClick={onSolve}
        disabled={isLoading}
        className="relative flex items-center justify-center w-48 h-14 px-4 py-2 bg-blue-600 border border-transparent rounded-xl shadow-lg text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-all duration-150"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="w-6 h-6 mr-3" />
            Solving...
          </>
        ) : (
          <>
            <SolveIcon className="w-6 h-6 mr-2" />
            Solve
          </>
        )}
      </button>
    </div>
  );
};
