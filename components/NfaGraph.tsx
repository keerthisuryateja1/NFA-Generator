import React, { useEffect, useRef } from 'react';
import type { NFA } from '../types';

declare const vis: any;

interface NfaGraphProps {
  nfa: NFA;
}

const NfaGraph: React.FC<NfaGraphProps> = ({ nfa }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof vis === 'undefined') {
      return;
    }

    const nodes = new vis.DataSet(
      nfa.states.map(state => {
        const isStart = state === nfa.startState;
        const isFinal = nfa.finalStates.includes(state);
        const isDead = state === nfa.deadState;

        let color: { border: string; background: string; highlight: { border: string; background: string } } = {
          border: '#6366f1', // indigo-500
          background: '#3730a3', // indigo-800
          highlight: {
            border: '#a78bfa', // violet-400
            background: '#6d28d9'  // violet-700
          }
        };
        let borderWidth = 2;

        if (isStart) {
          color.background = '#166534'; // green-800
          color.border = '#22c55e';     // green-500
        }
        if (isFinal) {
          borderWidth = 4;
        }
        if (isDead) {
          color.background = '#374151'; // gray-700
          color.border = '#6b7280';     // gray-500
        }

        return {
          id: state,
          label: state,
          color,
          borderWidth,
        };
      })
    );
    
    // Group transitions by from-to pairs to consolidate labels
    const edgeMap: { [key: string]: string[] } = {};
    for (const fromState in nfa.transitions) {
      for (const symbol in nfa.transitions[fromState]) {
        const toStates = nfa.transitions[fromState][symbol];
        if (toStates) {
          for (const toState of toStates) {
            const key = `${fromState}->-${toState}`;
            if (!edgeMap[key]) {
              edgeMap[key] = [];
            }
            edgeMap[key].push(symbol);
          }
        }
      }
    }
    
    const edges = new vis.DataSet(
      Object.keys(edgeMap).map(key => {
        const [from, to] = key.split('->-');
        const labels = edgeMap[key];
        return {
          from,
          to,
          label: labels.join(', '),
          arrows: 'to',
          smooth: {
            type: from === to ? 'continuous' : 'curvedCW',
            roundness: from === to ? 0 : 0.2
          },
        };
      })
    );


    const data = { nodes, edges };
    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'LR',
          sortMethod: 'directed',
          nodeSpacing: 150,
          treeSpacing: 200,
        },
      },
      edges: {
        font: {
          color: '#e5e7eb', // gray-200
          size: 14,
          strokeWidth: 0,
          align: 'top'
        },
        color: {
          color: '#6b7280',      // gray-500
          highlight: '#a78bfa',  // violet-400
        },
        width: 1.5
      },
      nodes: {
        font: {
          color: '#f9fafb', // gray-50
          size: 16,
        },
        shape: 'circle',
        size: 25,
        margin: 10,
      },
      physics: {
        enabled: false, // Hierarchical layout works better without physics
      },
      interaction: {
        dragNodes: true,
        zoomView: true,
        dragView: true,
      },
    };

    const network = new vis.Network(containerRef.current, data, options);

    // Add invisible node for start arrow
    nodes.add({
        id: 'start_node',
        hidden: true,
    });
    edges.add({
        from: 'start_node',
        to: nfa.startState,
        arrows: 'to',
        color: '#22c55e',
        length: 50,
    });


    return () => {
      if (network) {
        network.destroy();
      }
    };
  }, [nfa]);

  return (
    <div className="mt-2 bg-gray-800/50 p-2 rounded-lg border border-gray-700 shadow-lg">
      <div 
        ref={containerRef} 
        className="w-full h-[500px] bg-gray-800 rounded" 
        aria-label="Interactive NFA graph"
      />
    </div>
  );
};

export default NfaGraph;