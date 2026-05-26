// Defines my-header for the template header
class myHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="header">
        <div class="header-container" style="justify-content: center;">
          <a href="/"><img class="signature-image" src="/archive/images/ab_black_center.png"
              alt="Agape Bloom" /></a>
        </div>
      </header>
    `;
  }
}

class myFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <div class="footer-content">
          <div class="footer-description">
            <p>Agape Bloom (AB) is an independent systems practice.</p>
          </div>
          <div class="footer-articles">
            <h4>Recent Articles</h4>
            <div class="articles_cont">
              <a href="/archive/literary-synthesis/ideal-team-player.html">How to be a Team Player</a>
              <a href="/archive/literary-synthesis/designing-orgs-inforich-world.html">Designing Organizations for an
                Information-Rich World</a>
              <a href="/archive/literary-synthesis/logic-right-use-of-reason.html">Watts on How to Think</a>
              <a href="/archive/literary-synthesis/six-easy-pieces.html">Feynman: Six Easy Pieces</a>
            </div>
          </div>
          <div class="footer-links">
            <a href="https://www.linkedin.com/company/agapebloom/" target="_blank">
              <img src="/archive/images/yellow-linkedin-icon.png" alt="LinkedIn">
            </a>
            <a href="https://twitter.com" target="_blank">
              <img src="/archive/images/yellow-x_twitter-icon.png" alt="Twitter">
            </a>
            <a href="https://youtube.com" target="_blank">
              <img src="/archive/images/yellow-youtube-icon.png" alt="YouTube">
            </a>
          </div>
        </div>
        <p id="copywright">&copy; Agape Bloom. All rights reserved.</p>
      </footer>
    `;
  }
}

customElements.define('my-header', myHeader);
customElements.define('my-footer', myFooter);

// Filter system for archive pages
let activeFilters = [];

function toggleFilter(button, category, parent) {
  button.classList.toggle("active");

  const index = activeFilters.indexOf(category);
  if (index > -1) {
    activeFilters.splice(index, 1);
  } else {
    activeFilters.push(category);
  }

  if (activeFilters.length === 0) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
  }

  filterAndSortLinks(parent, "a");
}

function filterAndSortLinks(containerId, tagName) {
  var container = document.querySelector("." + containerId);
  var elements = Array.from(container.getElementsByTagName(tagName));

  elements.forEach((element) => (element.style.display = "none"));

  if (activeFilters.length > 0) {
    elements
      .filter((element) =>
        activeFilters.some((category) => element.classList.contains(category))
      )
      .forEach((element) => (element.style.display = ""));
  } else {
    elements.forEach((element) => (element.style.display = ""));
  }
}

function resetFilters() {
  activeFilters = [];

  document
    .querySelectorAll(".filter-btn")
    .forEach((button) => button.classList.remove("active"));

  filterAndSortLinks("apps-scripts-cont", "a");
}

/* =====================================================
   Clank chat window — local demo (speech-to-text ready)
   Drop this page on your server and wire the TODO below
   to a real Groq API call (free tier works great).
   ===================================================== */

function initClankChat() {
  const messagesEl = document.getElementById("chat-messages");
  const inputEl = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const micBtn = document.getElementById("mic-btn");

  if (!messagesEl || !inputEl || !sendBtn || !micBtn) return;

  function appendMessage(text, who = "clank") {
    const div = document.createElement("div");
    div.className = `message ${who}`;
    div.textContent = text.startsWith(">") ? text : `> ${text}`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    inputEl.value = "";

    // === TODO: Replace this block with real Groq call ===
    // Example (you'll need your own key + backend proxy for prod):
    //
    // fetch("/api/clank", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ message: text })
    // })
    // .then(r => r.json())
    // .then(data => appendMessage(data.reply, "clank"));

    // For now: simple local echo + hint (remove once Groq is wired)
    setTimeout(() => {
      appendMessage("Got it. (Real Groq reply will appear here once you wire the API.)", "clank");
    }, 420);
  }

  // Send button + Enter key
  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // === Local speech-to-text (Web Speech API) — works in Chrome/Edge ===
  // No server needed. Purely client-side.
  let recognition;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      inputEl.value = transcript;
      // Optional: auto-send after voice
      // sendMessage();
      micBtn.style.opacity = "1";
      micBtn.textContent = "🎙️";
    };

    recognition.onerror = () => {
      micBtn.style.opacity = "1";
      micBtn.textContent = "🎙️";
      appendMessage("Speech recognition error — try typing instead.", "clank");
    };

    recognition.onend = () => {
      micBtn.style.opacity = "1";
      micBtn.textContent = "🎙️";
    };

    micBtn.addEventListener("click", () => {
      try {
        micBtn.textContent = "●";
        micBtn.style.opacity = "0.6";
        recognition.start();
      } catch (err) {
        micBtn.textContent = "🎙️";
        micBtn.style.opacity = "1";
        appendMessage("Could not start microphone. Use Chrome/Edge for best results.", "clank");
      }
    });
  } else {
    // No browser support
    micBtn.addEventListener("click", () => {
      appendMessage("Speech-to-text not supported in this browser. Use Chrome or Edge.", "clank");
    });
    micBtn.title = "Speech-to-text not supported in this browser";
  }
}

// Initialize on load
document.addEventListener("DOMContentLoaded", initClankChat);
