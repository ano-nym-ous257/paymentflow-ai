const navItems = [...document.querySelectorAll("[data-view]")];
const views = [...document.querySelectorAll(".view")];
const viewTriggers = [...document.querySelectorAll("[data-view-trigger]")];
const rail = document.querySelector("#rail");
const menuButton = document.querySelector("#menuButton");
const copilotForm = document.querySelector(".chat-compose");
const copilotInput = document.querySelector("#copilotInput");
const chatStream = document.querySelector(".chat-stream");
const promptButtons = [...document.querySelectorAll(".prompt-row button")];
const globalSearchForm = document.querySelector(".search");
const globalSearchInput = document.querySelector("#globalSearch");
const prototypeNotice = document.querySelector("#prototypeNotice");
let noticeTimer;

function showPrototypeNotice(message) {
  if (!prototypeNotice) return;

  window.clearTimeout(noticeTimer);
  prototypeNotice.textContent = message;
  prototypeNotice.hidden = false;
  noticeTimer = window.setTimeout(() => {
    prototypeNotice.hidden = true;
  }, 3600);
}

function setView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });

  navItems.forEach((item) => {
    const isActive = item.dataset.view === viewId;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  rail?.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function appendMessage(text, type = "user") {
  if (!chatStream || !text.trim()) return;

  const message = document.createElement("div");
  message.className = `message ${type}`;

  if (type === "ai") {
    const strong = document.createElement("strong");
    strong.textContent = "PaymentFlow AI";
    message.append(strong, document.createTextNode(text));
  } else {
    message.textContent = text;
  }

  chatStream.appendChild(message);
  chatStream.scrollTop = chatStream.scrollHeight;
}

function generateCopilotReply(prompt) {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("expense")) {
    return "Top expenses are payroll, cloud infrastructure, card processing, and travel. I recommend switching 62% of EU payouts to SEPA instant and renegotiating two SaaS contracts.";
  }

  if (normalized.includes("revenue")) {
    return "Next month's revenue is projected between $2.08M and $2.16M, with enterprise expansion and faster collections as the strongest drivers.";
  }

  if (normalized.includes("late") || normalized.includes("customers")) {
    return "Media, logistics, and two marketplace customers show the highest late-payment probability. I can draft reminders and adjust the cash forecast.";
  }

  return "I found three actions: optimize payment routing, tighten approval policy for one vendor, and sweep idle USD into insured treasury for 38 bps of additional yield.";
}

navItems.forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.view));
});

viewTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => setView(trigger.dataset.viewTrigger));
});

menuButton?.addEventListener("click", () => {
  const isOpen = rail?.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !rail?.classList.contains("is-open")) return;
  rail.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.focus();
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setView("ai");
    appendMessage(button.textContent, "user");
    appendMessage(generateCopilotReply(button.textContent), "ai");
  });
});

copilotForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = copilotInput.value.trim();
  if (!prompt) return;

  appendMessage(prompt, "user");
  appendMessage(generateCopilotReply(prompt), "ai");
  copilotInput.value = "";
});

globalSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = globalSearchInput?.value.trim();
  if (!query) return;

  showPrototypeNotice(`Search for “${query}” is ready for backend integration; no live records were queried.`);
});

const prototypeActionButtons = [...document.querySelectorAll("button")].filter(
  (button) =>
    !button.matches(
      "[data-view], [data-view-trigger], #menuButton, .prompt-row button, .chat-compose button[type='submit']",
    ),
);

prototypeActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.getAttribute("aria-label") || button.textContent.trim() || "This action";
    showPrototypeNotice(`${action} is a prototype control; it does not move money or change live data.`);
  });
});
