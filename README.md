# SyntaxSense

SyntaxSense is a VS Code extension designed to help beginner and intermediate programmers understand code syntax while they write it. Instead of only giving an explanation, SyntaxSense turns selected code or the current line into a learning moment by explaining what the syntax does, saving recent explanation history, and generating quiz questions to reinforce the concept.

## Why I Built This

When learning a new programming language, remembering syntax can be difficult. Many tools can generate code, but they do not always help the user understand why the code works. SyntaxSense was built as an educational coding assistant that focuses on learning, retention, and active practice directly inside VS Code.

## Features

* **Explain selected code or current line**
  Highlight code in VS Code or place your cursor on a line, then run the Explain Syntax command to receive a beginner-friendly explanation.

* **Automatic language detection**
  SyntaxSense reads the current file language from VS Code so explanations can be tailored to the language being used.

* **Quiz Me feature**
  After receiving an explanation, users can generate a quiz question based on the code concept to check their understanding.

* **Interactive answer feedback**
  Quiz choices can be clicked directly in the extension UI, giving the user a more active way to learn.

* **Recent syntax history**
  SyntaxSense stores recent explanations so users can review the latest syntax concepts they asked about.

* **Keyboard shortcut support**
  The main Explain Syntax command can be triggered through a keybind for quick access while coding.

## Tech Stack

* **TypeScript**
* **VS Code Extension API**
* **Node.js**
* **PostgreSQL**
* **Drizzle ORM**
* **HTML/CSS/JavaScript Webview UI**
* **AI API integration**

## How It Works

1. The user selects code or places their cursor on a line in VS Code.
2. SyntaxSense collects the code, line number, source type, and programming language.
3. The extension sends that context to the backend or AI service.
4. The AI returns a clear explanation of the syntax.
5. The user can generate a quiz based on the explanation.
6. Recent explanations are saved so the user can review previous syntax questions.

## Installation and Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/PapiFab1/syntaxsense.git
cd syntaxsense
```

### 2. Install dependencies

```bash
npm install
```

If your project has a separate server folder, install dependencies there too:

```bash
cd server
npm install
```

### 3. Set up environment variables

Create a `.env` file in the backend/server folder.

```env
DATABASE_URL=your_postgresql_connection_string
AI_API_KEY=your_ai_api_key
```

The exact variable names may depend on your implementation.

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Run the extension

Open the project in VS Code and press:

```text
F5
```

This opens a new Extension Development Host window where SyntaxSense can be tested.

## Usage

1. Open a code file in VS Code.
2. Highlight a piece of code or place your cursor on a line.
3. Run the command:

```text
Explain Syntax
```

4. Read the generated explanation in the SyntaxSense panel.
5. Click **Quiz Me** to generate a practice question.
6. Select an answer to receive feedback.

## Example Use Case

A beginner learning JavaScript sees this line:

```js
const names = users.map(user => user.name);
```

SyntaxSense can explain that:

* `const` creates a variable that cannot be reassigned.
* `users.map(...)` loops through the `users` array and returns a new array.
* `user => user.name` is an arrow function that extracts the `name` property from each user.

Then the quiz feature can ask a question such as:

```text
What does the .map() method return?
```

This helps the user not only read the explanation, but also practice remembering the concept.

## Project Structure

```text
syntaxsense/
├── src/
│   ├── extension.ts        # Main VS Code extension logic
│   └── ...
├── server/
│   ├── db/                 # Drizzle and database setup
│   ├── routes/             # API routes
│   └── ...
├── package.json
├── README.md
└── .gitignore
```

The actual structure may vary depending on the current version of the project.

## Current Status

SyntaxSense currently supports:

* Explaining selected code
* Explaining the current line when no code is selected
* Displaying explanations in the extension UI
* Generating quiz questions from explanations
* Clicking quiz answers for feedback
* Saving and showing recent explanation history

## Future Improvements

* Add difficulty levels for quiz questions
* Track user progress over time
* Show weak syntax topics based on quiz performance
* Add support for flashcards
* Add syntax learning paths by language
* Improve explanation formatting with examples and common mistakes
* Add authentication so users can save learning history across devices

## What I Learned

While building SyntaxSense, I worked with the VS Code Extension API, command registration, editor selection handling, webview communication, backend API integration, PostgreSQL database storage, and AI-generated educational content. I also focused on turning a simple AI explanation tool into a more interactive learning experience through quizzes and history tracking.
