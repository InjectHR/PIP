const sections = Array.from(document.querySelectorAll("main section[id]"));
const navLinks = Array.from(document.querySelectorAll(".top-nav a"));
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const toast = document.getElementById("toast");

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;

  let active = sections[0]?.id;
  sections.forEach((section) => {
    if (section.offsetTop - 120 <= scrollTop) active = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${active}`);
  });
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

function showToast(message = "Copied") {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1500);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showToast("Copied");
  }
}

document.querySelectorAll(".copy-template").forEach((button) => {
  button.addEventListener("click", () => {
    const code = button.closest(".template-card").querySelector("code");
    copyText(code.innerText.trim());
  });
});

const decisionTree = {
  start: {
    question: "Is the concern mainly about work performance rather than misconduct?",
    path: "Path: Start the decision tree.",
    answers: [
      { label: "Yes, performance", next: "evidence" },
      { label: "No or mixed", result: "Pause and triage. Misconduct, refusal, harassment, bullying or serious conduct may need a disciplinary process rather than a PIP. If performance and conduct are mixed, separate the issues clearly and get advice before combining them." }
    ]
  },
  evidence: {
    question: "Can the concern be explained with objective examples and role-related standards?",
    path: "Path: Performance concern identified.",
    answers: [
      { label: "Yes", next: "support" },
      { label: "Not yet", result: "Do not issue a PIP yet. Gather evidence, check the role description, KPIs, policies, training history and prior feedback. Vague concerns make the process vulnerable and hard for the employee to improve against." }
    ]
  },
  support: {
    question: "Has the employee had adequate training, resources, supervision and clarity about expectations?",
    path: "Path: Evidence and standards checked.",
    answers: [
      { label: "Yes", next: "employeeInput" },
      { label: "No", result: "Fix the setup first. Clarify expectations, provide training or resources, and document support. A PIP can still follow, but it should not punish an employee for gaps the business has not addressed." }
    ]
  },
  employeeInput: {
    question: "Have you met with the employee and invited their response before finalising the plan?",
    path: "Path: Support and role clarity checked.",
    answers: [
      { label: "Yes", next: "pipReady" },
      { label: "No", result: "Hold the first meeting. Explain the concerns, provide examples, ask about barriers, invite support or adjustment requests, and document the response before finalising the PIP." }
    ]
  },
  pipReady: {
    question: "Does the PIP include measurable outcomes, review dates, support actions and consequences?",
    path: "Path: Employee response captured.",
    answers: [
      { label: "Yes", next: "review" },
      { label: "No", result: "Improve the PIP document before issuing it. Include specific concerns, examples, required outcomes, employee actions, manager actions, support, review dates and consequences." }
    ]
  },
  review: {
    question: "At review, has performance improved and been sustained?",
    path: "Path: PIP issued and review underway.",
    answers: [
      { label: "Yes, sustained", result: "Consider closing the PIP or moving to monitoring. Acknowledge the improvement in writing, confirm the standard that must continue, and keep a clear file note." },
      { label: "Some improvement", result: "Consider extending or continuing the PIP if that is reasonable. Recognise progress, explain what still needs to be sustained, and set the next review point." },
      { label: "No", next: "warning" }
    ]
  },
  warning: {
    question: "Has the employee already received a clear warning that termination may follow if performance does not improve?",
    path: "Path: Required performance not met.",
    answers: [
      { label: "Yes", next: "termination" },
      { label: "No", result: "A warning may be the next appropriate step. Confirm the evidence, summarise the employee's response, set expectations for immediate and sustained improvement, and state that further action may include termination." }
    ]
  },
  termination: {
    question: "Before deciding to terminate, has the employee had a chance to respond to the proposed termination?",
    path: "Path: Warning history and ongoing underperformance.",
    answers: [
      { label: "Yes", result: "Complete the final risk checks before confirming termination: process fairness, protected attribute risks, medical or adjustment issues, notice, final pay, award/agreement, contract, policy, and legal advice where appropriate." },
      { label: "No", result: "Do not finalise termination yet. Convene a disciplinary meeting, explain the proposal and reasons, invite a support person where appropriate, hear the employee's response, and consider it before making the decision." }
    ]
  }
};

const questionText = document.getElementById("questionText");
const pathLabel = document.getElementById("pathLabel");
const decisionButtons = document.getElementById("decisionButtons");
const decisionResult = document.getElementById("decisionResult");

function renderQuestion(key) {
  const node = decisionTree[key];
  questionText.textContent = node.question;
  pathLabel.textContent = node.path;
  decisionButtons.innerHTML = "";
  decisionResult.innerHTML = "<h3>Result</h3><p>Select an answer to see the recommended next step and risk check.</p>";
  node.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer.label;
    button.addEventListener("click", () => {
      if (answer.next) {
        renderQuestion(answer.next);
      } else {
        decisionResult.innerHTML = `<h3>Recommended next step</h3><p>${answer.result}</p><button class="button secondary" id="restartTree">Restart</button>`;
        document.getElementById("restartTree").addEventListener("click", () => renderQuestion("start"));
      }
    });
    decisionButtons.appendChild(button);
  });
}

renderQuestion("start");

const pipTable = document.getElementById("pipTable");
const concernInput = document.getElementById("concernInput");
const evidenceInput = document.getElementById("evidenceInput");
const outcomeInput = document.getElementById("outcomeInput");
const supportInput = document.getElementById("supportInput");

document.getElementById("addPipRow").addEventListener("click", () => {
  const row = pipTable.tBodies[0].insertRow();
  [concernInput.value, evidenceInput.value, outcomeInput.value, supportInput.value, "Add review evidence"].forEach((value) => {
    const cell = row.insertCell();
    cell.textContent = value.trim();
  });
  showToast("Added to table");
});

function tableToText(delimiter = "\t") {
  return Array.from(pipTable.rows)
    .map((row) => Array.from(row.cells).map((cell) => `"${cell.innerText.replaceAll('"', '""')}"`).join(delimiter))
    .join("\n");
}

document.getElementById("copyPipTable").addEventListener("click", () => {
  copyText(tableToText("\t"));
});

document.getElementById("downloadCsv").addEventListener("click", () => {
  const blob = new Blob([tableToText(",")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pip-builder.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});
