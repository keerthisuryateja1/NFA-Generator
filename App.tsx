import React, { useState } from 'react';
import InputForm from './components/InputForm';
import TransitionTable from './components/TransitionTable';
import NfaGraph from './components/NfaGraph';
import type { Quality, NFA } from './types';
import { QualityType } from './types';
import { generateNfaFromQualities } from './services/nfaGenerator';

const App: React.FC = () => {
  const [alphabet, setAlphabet] = useState<string>('ab');
  const [qualities, setQualities] = useState<Quality[]>([
    { id: 1, type: QualityType.CONTAINS, value: 'aba' },
  ]);
  const [nfa, setNfa] = useState<NFA | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alphabetError, setAlphabetError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');

  const handleAlphabetChange = (value: string) => {
    setAlphabet(value);
    if (value.trim() === '') {
        setAlphabetError(null);
        return;
    }
    if (!/^[a-zA-Z0-9]*$/.test(value)) {
      setAlphabetError("Alphabet can only contain alphanumeric characters.");
    } else if (new Set(value.split('')).size !== value.length) {
      setAlphabetError("Alphabet cannot contain duplicate characters.");
    } else {
      setAlphabetError(null);
    }
  };

  const handleGenerate = () => {
    setError(null);
    setNfa(null);

    if (alphabetError) {
        setError("Please fix the errors in the alphabet field before generating.");
        return;
    }

    const uniqueAlphabet = [...new Set(alphabet.split(''))].join('');
    if (uniqueAlphabet.length === 0) {
        setError("Alphabet cannot be empty.");
        return;
    }

    try {
      const generatedNfa = generateNfaFromQualities(uniqueAlphabet, qualities);
      setNfa(generatedNfa);
      setViewMode('table');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during generation.");
      }
    }
  };

  const ViewSwitcher: React.FC = () => (
      <div className="flex justify-center my-6 p-1 bg-gray-800 rounded-lg space-x-1 border border-gray-700 w-fit mx-auto">
        <button 
            onClick={() => setViewMode('table')} 
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50'}`}
            aria-pressed={viewMode === 'table'}
        >
            Table
        </button>
        <button 
            onClick={() => setViewMode('graph')} 
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${viewMode === 'graph' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50'}`}
            aria-pressed={viewMode === 'graph'}
        >
            Graph
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            NFA Transition Table Generator
          </h1>
          <p className="mt-2 text-gray-400">
            Define your language properties to generate a corresponding NFA.
          </p>
        </header>

        <main>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
            <InputForm
              alphabet={alphabet}
              setAlphabet={handleAlphabetChange}
              alphabetError={alphabetError}
              qualities={qualities}
              setQualities={setQualities}
              onGenerate={handleGenerate}
            />
          </div>

          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {nfa && (
            <>
              <ViewSwitcher />
              {viewMode === 'table' ? <TransitionTable nfa={nfa} /> : <NfaGraph nfa={nfa} />}
            </>
          )}
        </main>
        <footer className="text-center mt-12 text-gray-600 text-sm">
            <p>Built with Automata Theory</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
