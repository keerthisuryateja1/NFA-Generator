import React from 'react';
import type { NFA } from '../types';

interface TransitionTableProps {
  nfa: NFA;
}

const TransitionTable: React.FC<TransitionTableProps> = ({ nfa }) => {
  const getDisplayState = (state: string) => {
    let prefix = '';
    if (state === nfa.startState) {
      prefix += '→ ';
    }
    if (nfa.finalStates.includes(state)) {
      prefix += '* ';
    }
    return prefix + state;
  };

  const formatTransition = (states: string[] | undefined) => {
    if (!states || states.length === 0) {
      return '—';
    }
    return `{${states.join(', ')}}`;
  };

  return (
    <div className="mt-8 bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-indigo-400">Generated Transition Table</h2>
      <div className="flex flex-col mb-4 space-y-1 text-sm text-gray-300">
        <span><span className="font-semibold">Start State:</span> {nfa.startState}</span>
        <span><span className="font-semibold">Final States:</span> {`{${nfa.finalStates.join(', ')}}`}</span>
        {nfa.deadState && <span><span className="font-semibold">Dead State:</span> {nfa.deadState}</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                State
              </th>
              {nfa.alphabet.map((symbol) => (
                <th key={symbol} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800/50 divide-y divide-gray-700">
            {nfa.states.map((state) => (
              <tr key={state}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{getDisplayState(state)}</td>
                {nfa.alphabet.map((symbol) => (
                  <td key={symbol} className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                    {formatTransition(nfa.transitions[state]?.[symbol])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <p className="mt-4 text-xs text-gray-500">
          Note: '→' indicates the start state. '*' indicates a final (accepting) state.
        </p>
    </div>
  );
};

export default TransitionTable;
