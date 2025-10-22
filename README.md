<div align="center">
  <img alt="NFA Transition Table Generator Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NFA Transition Table Generator

The NFA Transition Table Generator is a web-based tool that allows you to define a set of properties for a formal language and automatically generate the corresponding Nondeterministic Finite Automaton (NFA). You can visualize the resulting NFA as an interactive graph or view its transition table.

This tool is perfect for students, educators, and developers who are working with automata theory, formal languages, or compiler design. It provides a simple and intuitive way to create and understand complex NFAs without the need for manual construction.

## How it Works

The application uses core concepts from automata theory to construct an NFA that accepts the language you define. Here's a simplified overview of the process:

1.  **Define Language Properties**: You specify a set of "qualities" that the strings in your language must adhere to. These qualities can include properties like "starts with," "ends with," or "contains" a specific substring.

2.  **Build Individual Automata**: For each quality you define, the application constructs a separate Deterministic Finite Automaton (DFA) that recognizes that specific property.

3.  **Intersect Automata**: The individual DFAs are then combined using the product construction algorithm, which computes the intersection of the languages accepted by each automaton. The result is a single NFA that accepts only the strings that satisfy *all* of the defined qualities.

4.  **Generate and Visualize**: The final NFA is then presented to you in two formats:
    *   **Transition Table**: A clear and concise table that shows the transitions between states for each symbol in the alphabet.
    *   **Interactive Graph**: A visual representation of the NFA, where you can drag and rearrange the states to better understand its structure.

## Features

*   **Intuitive Interface**: A user-friendly interface for defining the alphabet and language qualities.
*   **Multiple Language Properties**: Supports a variety of language properties, including `STARTS_WITH`, `ENDS_WITH`, and `CONTAINS`.
*   **Dual Visualization**: View the generated NFA as either a transition table or an interactive graph.
*   **Error Highlighting**: The application provides real-time feedback and error checking to help you define valid alphabets and properties.
*   **Dead State Detection**: Automatically identifies and flags any dead states in the generated NFA.

## How to Use

1.  **Enter the Alphabet**: In the "Alphabet" field, enter the set of symbols that your language will use (e.g., `ab`, `01`).

2.  **Define Qualities**:
    *   Click the "Add Quality" button to add a new language property.
    *   Select the type of quality (`starts with`, `ends with`, or `contains`).
    *   Enter the value for the quality (e.g., `aba`).

3.  **Generate the NFA**: Once you have defined your alphabet and qualities, click the "Generate NFA" button.

4.  **View the Results**:
    *   Use the switcher to toggle between the "Table" and "Graph" views.
    *   In the graph view, you can click and drag the states to rearrange them.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Run Locally

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/USERNAME/nfa-transition-table-generator.git
    cd nfa-transition-table-generator
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up your API Key**:
    Create a `.env.local` file in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=YOUR_API_KEY
    ```

3.  **Run the application**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

## Technologies Used

*   **React**: A JavaScript library for building user interfaces.
*   **Vite**: A fast and modern build tool for web development.
*   **TypeScript**: A typed superset of JavaScript that enhances code quality and maintainability.

---

*This project was built with a passion for computer science and a desire to make automata theory more accessible.*
