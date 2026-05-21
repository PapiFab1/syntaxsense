import * as vscode from "vscode";

//code context
type CodeContext = {
  code: string;
  lineNumber: number;
  source: "current line" | "selection";
  language: string;
  range: vscode.Range;
};

//history for explanations
type ExplanationHistoryItem = {
  id: number;
  userId: string;
  language: string;
  source: string;
  lineNumber: number;
  code: string;
  explanation: string;
  createdAt: string;
};

type ExplainResponse = {
  explanation: string;
  explanationId: number;
};

type QuizItem = {
  id: number;
  explanationId: number;
  question: string;
  choices: string[];
  correctAnswer: string;
  userAnswer?: string | null;
  isCorrect?: boolean | null;
  createdAt: string;
};

//sideabar view
//TO DO: Add views for history and quizzes
class SyntaxSenseViewProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.type === "quizMe") {
        try {
          const quiz = await generateQuizWithBackend(message.explanationId);
          this.showQuiz(quiz);
        } catch (error) {
          console.error(error);
          vscode.window.showErrorMessage(
            "SyntaxSense could not generate a quiz. Make sure the backend is running.",
          );
        }
      }
    });
  }

  showLoading(codeContext: CodeContext) {
    if (!this.view) {
      return;
    }

    this.view.webview.postMessage({
      type: "loading",
      codeContext,
    });
  }

  showExplanation(
    codeContext: CodeContext,
    explanation: string,
    explanationId: number,
    history: ExplanationHistoryItem[] = [],
  ) {
    if (!this.view) {
      return;
    }

    this.view.webview.postMessage({
      type: "explanation",
      codeContext,
      explanation,
      explanationId,
      history,
    });
  }

  showHistory(history: ExplanationHistoryItem[]) {
    if (!this.view) {
      return;
    }

    this.view.webview.postMessage({
      type: "history",
      history,
    });
  }

  showQuiz(quiz: QuizItem) {
    if (!this.view) {
      return;
    }

    this.view.webview.postMessage({
      type: "quiz",
      quiz,
    });
  }

  private getHtml(): string {
    return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<style>
					body {
						font-family: var(--vscode-font-family);
						color: var(--vscode-foreground);
						background-color: var(--vscode-sideBar-background);
						padding: 16px;
						line-height: 1.5;
					}

					h2 {
						margin-top: 0;
						color: var(--vscode-editor-foreground);
					}

					.card {
						border: 1px solid var(--vscode-sideBar-border);
						border-radius: 10px;
						padding: 12px;
						margin-bottom: 12px;
						background-color: var(--vscode-editor-background);
					}

					.label {
						font-size: 12px;
						opacity: 0.8;
						margin-bottom: 4px;
					}

					pre {
						white-space: pre-wrap;
						word-wrap: break-word;
						background: var(--vscode-textCodeBlock-background);
						padding: 10px;
						border-radius: 8px;
						overflow-x: auto;
					}

					.empty {
						opacity: 0.75;
					}
				</style>
			</head>
			<body>
				<h2>SyntaxSense</h2>

				<div id="content" class="empty">
					Select code or place your cursor on a line, then run <b>SyntaxSense: Explain Syntax</b>.
				</div>

				<script>
	const content = document.getElementById("content");
	const vscode = acquireVsCodeApi();
	let currentQuiz = null;

	window.addEventListener("message", event => {
		const message = event.data;

		if (message.type === "loading") {
			const ctx = message.codeContext;

			content.className = "";
			content.innerHTML =
				'<div class="card">' +
					'<div class="label">Analyzing</div>' +
					'<p>Getting syntax explanation...</p>' +
				'</div>' +
				'<div class="card">' +
					'<div class="label">Code</div>' +
					'<pre>' + escapeHtml(ctx.code) + '</pre>' +
				'</div>';
		}

		if (message.type === "explanation") {
			const ctx = message.codeContext;
			const history = message.history || [];

			content.className = "";

			content.innerHTML =
				'<div class="card">' +
					'<div class="label">Language</div>' +
					'<div>' + escapeHtml(ctx.language) + '</div>' +
				'</div>' +

				'<div class="card">' +
					'<div class="label">Line</div>' +
					'<div>' + ctx.lineNumber + '</div>' +
				'</div>' +

				'<div class="card">' +
					'<div class="label">Code</div>' +
					'<pre>' + escapeHtml(ctx.code) + '</pre>' +
				'</div>' +

				'<div class="card">' +
					'<div class="label">Explanation</div>' +
					'<div>' + formatExplanation(message.explanation) + '</div>' +
				'</div>' +

				'<div class="card">' +
					'<button id="quizMeButton" data-explanation-id="' + message.explanationId + '">' +
						'Quiz Me' +
					'</button>' +
				'</div>' +

				renderHistoryCards(history);
		}

		if (message.type === "history") {
			content.className = "";
			content.innerHTML = renderHistoryCards(message.history);
		}

		if (message.type === "quiz") {
	const quiz = message.quiz;
	currentQuiz = quiz;

	content.className = "";

	content.innerHTML =
		'<div class="card">' +
			'<div class="label">Quiz</div>' +
			'<h3>' + escapeHtml(quiz.question) + '</h3>' +
		'</div>' +

		quiz.choices.map(function(choice, index) {
			return (
				'<div class="card">' +
					'<button class="choiceButton" data-choice-index="' + index + '">' +
						escapeHtml(choice) +
					'</button>' +
				'</div>'
			);
		}).join("") +

		'<div id="quizFeedback"></div>';
}
	});

	document.addEventListener("click", function(event) {
	const target = event.target;

	if (target && target.id === "quizMeButton") {
		vscode.postMessage({
			type: "quizMe",
			explanationId: Number(target.dataset.explanationId)
		});
	}

	if (target && target.classList && target.classList.contains("choiceButton")) {
		if (!currentQuiz) {
			return;
		}

		const choiceIndex = Number(target.dataset.choiceIndex);
		const selectedChoice = currentQuiz.choices[choiceIndex];
		const isCorrect = selectedChoice === currentQuiz.correctAnswer;

		const feedback = document.getElementById("quizFeedback");

		if (feedback) {
			feedback.innerHTML =
				'<div class="card">' +
					'<div class="label">Result</div>' +
					'<p><b>' + (isCorrect ? "Correct!" : "Not quite.") + '</b></p>' +
					'<p>Your answer: ' + escapeHtml(selectedChoice) + '</p>' +
					'<p>Correct answer: ' + escapeHtml(currentQuiz.correctAnswer) + '</p>' +
				'</div>';
		}

		const buttons = document.querySelectorAll(".choiceButton");
		buttons.forEach(function(button) {
			button.disabled = true;
		});
	}
});

	function renderHistoryCards(history) {
		if (!history || history.length === 0) {
			return (
				'<div class="card">' +
					'<div class="label">Recent Explanations</div>' +
					'<p>No saved explanations yet.</p>' +
				'</div>'
			);
		}

		return (
			'<div class="card">' +
				'<div class="label">Recent Explanations</div>' +
				'<p>Your latest saved syntax explanations.</p>' +
			'</div>' +

			history.map(function(item) {
				return (
					'<div class="card">' +
						'<div class="label">' +
							escapeHtml(item.language) + ' • Line ' + item.lineNumber +
						'</div>' +
						'<pre>' + escapeHtml(item.code) + '</pre>' +
						'<div>' + formatExplanation(item.explanation) + '</div>' +
					'</div>'
				);
			}).join("")
		);
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	function formatExplanation(value) {
		return escapeHtml(value).replace(/\\n/g, "<br>");
	}
</script>
									</body>
									</html>
		`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "syntaxsense" is now active!');

  const syntaxSenseViewProvider = new SyntaxSenseViewProvider();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "syntaxsense.sidebar",
      syntaxSenseViewProvider,
    ),
  );

  const disposable = vscode.commands.registerCommand(
    "syntaxsense.explainSyntax",
    async () => {
      const editor = vscode.window.activeTextEditor;

      //if not in editor show error message
      if (!editor) {
        vscode.window.showWarningMessage("Open a file first");
        return;
      }

      //.document allows me to read the document and .selection allows for text selection
      const document = editor.document;
      const selection = editor.selection;

      //grabs selected code
      let selectedCode = document.getText(selection);
      const currentLine = document.lineAt(selection.active);

      let codeContext: CodeContext;

      //returns object for code context for if code isnt selected
      if (!selectedCode.trim()) {
        codeContext = {
          code: currentLine.text,
          lineNumber: currentLine.lineNumber + 1,
          source: "current line",
          language: document.languageId,
          range: currentLine.range,
        };
      } else {
        //returns object for code context if code is selected by user
        codeContext = {
          code: selectedCode,
          lineNumber: selection.start.line + 1,
          source: "selection",
          language: document.languageId,
          range: selection,
        };
      }

      try {
        await vscode.commands.executeCommand("syntaxsense.sidebar.focus");

        syntaxSenseViewProvider.showLoading(codeContext);

        const result = await explainSyntaxWithBackend(codeContext);

        const history = await getExplanationHistory();

        syntaxSenseViewProvider.showExplanation(
          codeContext,
          result.explanation,
          result.explanationId,
          history,
        );
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(
          "SyntaxSense could not get an explanation. Make sure the backend is running.",
        );
      }
    },
  );

  context.subscriptions.push(disposable);

  const historyDisposable = vscode.commands.registerCommand(
    "syntaxsense.showHistory",
    async () => {
      try {
        await vscode.commands.executeCommand("syntaxsense.sidebar.focus");

        const history = await getExplanationHistory();

        syntaxSenseViewProvider.showHistory(history);
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(
          "SyntaxSense could not load history. Make sure the backend is running.",
        );
      }
    },
  );

  context.subscriptions.push(historyDisposable);
}

//testing first function
function explainSyntax(context: CodeContext): string {
  return `This is ${context.language} code from line ${context.lineNumber}.
	
	Source: ${context.source}

	Code:
	${context.code}

	Explanation:
	This code uses syntax from ${context.language}. Later this function can explain keywords, variables, functions, syumbols, and structure line by line.`;
}

async function explainSyntaxWithBackend(
  codeContext: CodeContext,
): Promise<ExplainResponse> {
  const response = await fetch("http://localhost:3000/api/explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(codeContext),
  });

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    explanation?: string;
    explanationId?: number;
    error?: string;
  };

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    explanation: data.explanation ?? "No explanation returned from backend.",
    explanationId: data.explanationId ?? 0,
  };
}

async function getExplanationHistory(): Promise<ExplanationHistoryItem[]> {
  const response = await fetch("http://localhost:3000/api/history");

  if (!response.ok) {
    throw new Error(`History request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    history: ExplanationHistoryItem[];
  };

  return data.history;
}

async function generateQuizWithBackend(
  explanationId: number,
): Promise<QuizItem> {
  const response = await fetch(
    `http://localhost:3000/api/explanations/${explanationId}/quiz`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Quiz request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    quiz?: QuizItem;
    error?: string;
  };

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.quiz) {
    throw new Error("No quiz returned from backend.");
  }

  return data.quiz;
}

// This method is called when your extension is deactivated
export function deactivate() {}
