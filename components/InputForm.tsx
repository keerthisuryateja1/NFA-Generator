import React from 'react';
import type { Quality } from '../types';
import { QualityType } from '../types';
import PlusIcon from './icons/PlusIcon';
import XMarkIcon from './icons/XMarkIcon';

interface InputFormProps {
  alphabet: string;
  setAlphabet: (value: string) => void;
  alphabetError: string | null;
  qualities: Quality[];
  setQualities: (qualities: Quality[]) => void;
  onGenerate: () => void;
}

const InputForm: React.FC<InputFormProps> = ({
  alphabet,
  setAlphabet,
  alphabetError,
  qualities,
  setQualities,
  onGenerate,
}) => {
  const handleAddQuality = () => {
    setQualities([
      ...qualities,
      {
        id: Date.now(),
        type: QualityType.CONTAINS,
        value: '',
      },
    ]);
  };

  const handleRemoveQuality = (id: number) => {
    setQualities(qualities.filter((q) => q.id !== id));
  };

  const handleQualityChange = (id: number, field: 'type' | 'value', value: string) => {
    setQualities(
      qualities.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="alphabet" className="block text-sm font-medium text-gray-400 mb-2">
          Language Alphabet
        </label>
        <input
          type="text"
          id="alphabet"
          value={alphabet}
          onChange={(e) => setAlphabet(e.target.value)}
          placeholder="e.g., ab01"
          className={`w-full bg-gray-800 border rounded-md shadow-sm py-2 px-3 focus:outline-none text-white transition-colors ${
            alphabetError
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
          aria-invalid={!!alphabetError}
          aria-describedby={alphabetError ? 'alphabet-error' : undefined}
        />
        {alphabetError && (
            <p id="alphabet-error" className="mt-2 text-sm text-red-400" role="alert">
                {alphabetError}
            </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">String Qualities</h3>
        <div className="space-y-4">
          {qualities.map((quality) => (
            <div key={quality.id} className="flex items-center space-x-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <select
                value={quality.type}
                onChange={(e) => handleQualityChange(quality.id, 'type', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              >
                {Object.values(QualityType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                value={quality.value}
                onChange={(e) => handleQualityChange(quality.id, 'value', e.target.value)}
                placeholder="e.g., ab"
                className="flex-grow bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
              <button
                onClick={() => handleRemoveQuality(quality.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddQuality}
            className="flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Quality</span>
          </button>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!alphabet.trim() || !!alphabetError || qualities.some(q => !q.value.trim())}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-all duration-200"
      >
        Generate Transition Table
      </button>
    </div>
  );
};

export default InputForm;
