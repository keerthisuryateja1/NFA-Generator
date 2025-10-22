import type { Quality, NFA, TransitionMap } from '../types';
import { QualityType } from '../types';

// A temporary, more structured NFA representation for internal use
interface RawNFA {
  states: Set<string>;
  alphabet: string[];
  transitions: { [state: string]: { [symbol:string]: Set<string> } };
  startState: string;
  finalStates: Set<string>;
}

/**
 * Builds a Deterministic Finite Automaton (DFA), which is a type of NFA, for a single quality rule.
 */
const buildDfaForQuality = (alphabet: string[], quality: Quality): RawNFA => {
    const { type, value } = quality;
    const states = new Set<string>();
    const transitions: { [state: string]: { [symbol: string]: Set<string> } } = {};
    let startState = 'q0';
    const finalStates = new Set<string>();
    const deadState = 'D';

    const initState = (state: string) => {
        if (!transitions[state]) {
            transitions[state] = {};
            for (const char of alphabet) {
                transitions[state][char] = new Set();
            }
        }
    };
    
    // Create KMP failure function (LPS array) for efficient state transitions
    const computeLps = (pattern: string): number[] => {
        const lps = new Array(pattern.length).fill(0);
        let length = 0;
        let i = 1;
        while (i < pattern.length) {
            if (pattern[i] === pattern[length]) {
                length++;
                lps[i] = length;
                i++;
            } else {
                if (length !== 0) {
                    length = lps[length - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    };

    switch (type) {
        case QualityType.STARTS_WITH:
            for (let i = 0; i <= value.length; i++) states.add(`q${i}`);
            states.add(deadState);
            startState = 'q0';
            finalStates.add(`q${value.length}`);

            for(const state of states) initState(state);

            // Transitions for the match
            for (let i = 0; i < value.length; i++) {
                transitions[`q${i}`][value[i]].add(`q${i + 1}`);
            }

            // Other transitions go to dead state
            for (let i = 0; i < value.length; i++) {
                for (const char of alphabet) {
                    if (char !== value[i]) {
                        transitions[`q${i}`][char].add(deadState);
                    }
                }
            }
            
            // Final state loops on all symbols
            for (const char of alphabet) {
                transitions[`q${value.length}`][char].add(`q${value.length}`);
                transitions[deadState][char].add(deadState);
            }
            break;

        case QualityType.CONTAINS:
        case QualityType.ENDS_WITH:
            const lps = computeLps(value);
            for (let i = 0; i <= value.length; i++) states.add(`q${i}`);
            startState = 'q0';
            finalStates.add(`q${value.length}`);

            for(const state of states) initState(state);

            for (let i = 0; i <= value.length; i++) {
                for (const char of alphabet) {
                    if (i < value.length && char === value[i]) {
                        transitions[`q${i}`][char].add(`q${i + 1}`);
                    } else {
                        if (i > 0) {
                             // Use LPS array to find next state
                            let j = i;
                            while(j > 0 && char !== value[j]) {
                                j = lps[j-1];
                            }
                            if (char === value[j]) {
                                j++;
                            }
                            transitions[`q${i}`][char].add(`q${j}`);
                        } else {
                            transitions[`q${i}`][char].add('q0');
                        }
                    }
                }
            }
            
            if (type === QualityType.CONTAINS) {
                // Final state loops on all symbols
                for (const char of alphabet) {
                    transitions[`q${value.length}`][char].add(`q${value.length}`);
                }
            }
            break;
    }

    return { states, alphabet, transitions, startState, finalStates };
};

/**
 * Computes the intersection of two NFAs using the product construction algorithm.
 */
const intersectNfas = (nfa1: RawNFA, nfa2: RawNFA): RawNFA => {
    const alphabet = nfa1.alphabet;
    const startState = `${nfa1.startState},${nfa2.startState}`;
    const queue = [startState];
    const visited = new Set([startState]);

    const newStates = new Set<string>();
    const newFinalStates = new Set<string>();
    const newTransitions: { [state: string]: { [symbol: string]: Set<string> } } = {};

    while (queue.length > 0) {
        const currentStateTuple = queue.shift()!;
        newStates.add(currentStateTuple);
        const [state1, state2] = currentStateTuple.split(',');

        if (nfa1.finalStates.has(state1) && nfa2.finalStates.has(state2)) {
            newFinalStates.add(currentStateTuple);
        }

        newTransitions[currentStateTuple] = {};

        for (const char of alphabet) {
            newTransitions[currentStateTuple][char] = new Set();
            const nextStates1 = nfa1.transitions[state1]?.[char] ?? new Set();
            const nextStates2 = nfa2.transitions[state2]?.[char] ?? new Set();

            for (const ns1 of nextStates1) {
                for (const ns2 of nextStates2) {
                    const nextStateTuple = `${ns1},${ns2}`;
                    newTransitions[currentStateTuple][char].add(nextStateTuple);
                    if (!visited.has(nextStateTuple)) {
                        visited.add(nextStateTuple);
                        queue.push(nextStateTuple);
                    }
                }
            }
        }
    }

    return {
        states: newStates,
        alphabet,
        transitions: newTransitions,
        startState,
        finalStates: newFinalStates,
    };
};


/**
 * Renames the composite states of an NFA to a simpler format (Q0, Q1, ...) for display.
 */
const renameNfaStates = (nfa: RawNFA): NFA => {
    const stateMap = new Map<string, string>();
    let counter = 0;
    const getNewStateName = (oldName: string) => {
        if (!stateMap.has(oldName)) {
            stateMap.set(oldName, `Q${counter++}`);
        }
        return stateMap.get(oldName)!;
    };

    const newStartState = getNewStateName(nfa.startState);
    
    // Ensure start state and then all other states are mapped
    const sortedOldStates = Array.from(nfa.states).sort((a,b) => a === nfa.startState ? -1 : b === nfa.startState ? 1: 0);
    const newStates = sortedOldStates.map(getNewStateName);


    const newFinalStates = Array.from(nfa.finalStates).map(getNewStateName);
    const newTransitions: TransitionMap = {};

    for (const oldState of sortedOldStates) {
        const newState = getNewStateName(oldState);
        newTransitions[newState] = {};
        for (const char of nfa.alphabet) {
            const nextStates = Array.from(nfa.transitions[oldState]?.[char] ?? []).map(getNewStateName);
            newTransitions[newState][char] = nextStates;
        }
    }
    
    // Identify dead state
    let deadState: string | null = null;
    for (const state of newStates) {
        if (newFinalStates.includes(state)) continue;
        
        let isDead = true;
        for (const char of nfa.alphabet) {
            const transitionsTo = newTransitions[state][char];
            if (transitionsTo.length !== 1 || transitionsTo[0] !== state) {
                isDead = false;
                break;
            }
        }
        if (isDead) {
            deadState = state;
            break;
        }
    }


    return {
        states: newStates,
        alphabet: nfa.alphabet,
        transitions: newTransitions,
        startState: newStartState,
        finalStates: newFinalStates,
        deadState: deadState
    };
};

/**
 * Generates an NFA that accepts the intersection of languages defined by a set of qualities.
 */
export const generateNfaFromQualities = (
  alphabetStr: string,
  qualities: Quality[]
): NFA => {
    const alphabet = alphabetStr.split('');
    
    if (qualities.length === 0) {
        // NFA for Σ* (accepts all strings)
        return {
            states: ['Q0'],
            alphabet,
            startState: 'Q0',
            finalStates: ['Q0'],
            transitions: { 'Q0': Object.fromEntries(alphabet.map(c => [c, ['Q0']])) },
            deadState: null,
        };
    }

    let combinedNfa = buildDfaForQuality(alphabet, qualities[0]);

    for (let i = 1; i < qualities.length; i++) {
        const nextNfa = buildDfaForQuality(alphabet, qualities[i]);
        combinedNfa = intersectNfas(combinedNfa, nextNfa);
    }

    return renameNfaStates(combinedNfa);
};
