// Defines my-header for the template header
class myHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="header">
        <div class="header-container" style="justify-content: center;">
          <a href="https://agapebloom.com"><img class="signature-image" src="https://agapebloom.com/archive/images/ab_black_center.png"
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
            <p>Agape Bloom (AB) is a Louisiana-forged firm.</p>
          </div>
          <div class="footer-articles">
            <h4>Recent Articles</h4>
            <div class="articles_cont">
              <a href="https://agapebloom.com/archive/literary-synthesis/ideal-team-player.html">How to be a Team Player</a>
              <a href="https://agapebloom.com/archive/literary-synthesis/notes_from_underground.html">Dostoevsky's Warning</a>
              <a href="https://agapebloom.com/archive/literary-synthesis/designing-orgs-inforich-world.html">Designing Organizations for an
                Information-Rich World</a>
              <a href="https://agapebloom.com/archive/literary-synthesis/logic-right-use-of-reason.html">Watts on How to Think</a>
            </div>
          </div>
          <div class="footer-links">
            <a href="https://www.linkedin.com/company/agapebloom/" target="_blank">
              <img src="https://agapebloom.com/archive/images/yellow-linkedin-icon.png" alt="LinkedIn">
            </a>
            <a href="https://twitter.com" target="_blank">
              <img src="https://agapebloom.com/archive/images/yellow-x_twitter-icon.png" alt="Twitter">
            </a>
            <a href="https://youtube.com" target="_blank">
              <img src="https://agapebloom.com/archive/images/yellow-youtube-icon.png" alt="YouTube">
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
