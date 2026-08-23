/**
 * @typedef {Object} ProfileData
 * @property {{name: {full: string}, headline: string, location: {city: string, country: string}, links: Array<{type: string, value: string}>, summary: string}} person
 */

const siteHeader = document.getElementById("site-header");
const heroName = document.querySelector(".hero .name");
const navigationLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const navigationSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

/** Scroll to a navigation target while accounting for the fixed header. */
navigationLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();
    const targetTop = Math.max(0, target.offsetTop - siteHeader.offsetHeight);

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  });
});

/** Show the navigation only after the hero has started scrolling away. */
function updateSiteHeader() {
  siteHeader.classList.toggle("has-scrolled", heroName.getBoundingClientRect().top <= 0);
}

document.addEventListener("scroll", updateSiteHeader, { passive: true });
updateSiteHeader();

/** Highlight the navigation item for the section currently in view. */
function updateActiveNavigation() {
  const marker = window.scrollY + window.innerHeight * 0.35;
  let currentSection;

  navigationSections.forEach((section) => {
    if (section.offsetTop <= marker) {
      currentSection = section;
    }
  });

  navigationLinks.forEach((link) => {
    const isActive = currentSection &&
      link.getAttribute("href") === `#${currentSection.id}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

document.addEventListener("scroll", updateActiveNavigation, { passive: true });
window.addEventListener("resize", updateActiveNavigation);

/** Observe content blocks and reveal them as they enter the viewport. */
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll(".reveal");
  document.documentElement.classList.add("has-scroll-animations");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const revealVisibleElements = () => {
    animatedElements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
        element.classList.add("is-visible");
      }
    });
  };

  document.addEventListener("scroll", revealVisibleElements, { passive: true });
  window.addEventListener("resize", revealVisibleElements);
  revealVisibleElements();
}

/**
 * Fetch portfolio data and render every scroll-page section.
 * @returns {Promise<void>}
 */
async function loadProfile() {
  /** @type {ProfileData} */
  const response = await fetch("./data.json").then((data) => data.json());
  const titleDiv = document.getElementById("title");
  titleDiv.textContent = response.person.headline;
  const emailLinks = response.person.links.filter((link) => link.type === "email");
  const fallbackEmail = emailLinks[0];
  const workEmail = emailLinks.find((link) => link.subtype === "work");
  const personalEmail = emailLinks.find((link) => link.subtype === "personal") ?? fallbackEmail;
  const externalLinks = response.person.links.filter(
    (link) => link.type !== "email",
  );

  document.getElementById("profile").innerHTML = `
    <div class="profile-heading reveal">
      <h2>Profile</h2>
    </div>
    <div class="profile-grid">
      <div class="reveal reveal-delay-1">
        <p class="summary">${response.person.summary}</p>
        <div class="profile-links">
          ${externalLinks.map((link) => `<a class="profile-link" href="${link.value}" target="_blank" rel="noreferrer">${link.type}</a>`).join("")}
        </div>
      </div>
      <div class="profile-details reveal reveal-delay-2">
        <div class="detail">
          <span class="detail-label">Name</span>
          <span class="detail-value">${response.person.name.full}</span>
        </div>
        <div class="detail">
          <span class="detail-label">Role</span>
          <span class="detail-value">${response.person.headline}</span>
        </div>
        <div class="detail">
          <span class="detail-label">Based in</span>
          <span class="detail-value">${response.person.location.city}, ${response.person.location.country}</span>
        </div>
        ${personalEmail ? `<div class="detail">
          <span class="detail-label">Contact</span>
          <a class="detail-value" href="mailto:${personalEmail.value}">${personalEmail.value}</a>
        </div>` : ""}
        ${workEmail && workEmail.value !== personalEmail?.value ? `<div class="detail">
          <span class="detail-label">Work Email</span>
          <a class="detail-value" href="mailto:${workEmail.value}">${workEmail.value}</a>
        </div>` : ""}
      </div>
    </div>
  `;

  document.getElementById("experience").innerHTML = `
    <div class="section-heading">
      <p class="section-kicker">Experience</p>
      <h2>Work</h2>
    </div>
    ${response.employment.map((role) => `
      <article class="experience-item reveal">
        <div class="experience-meta">
          <strong>${role.organization.name}</strong>
          ${role.organization.location}<br>
          ${role.start_date} - ${role.current ? "Present" : role.end_date}
        </div>
        <div class="experience-content">
          <h3>${role.title}</h3>
          <ul>${role.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}</ul>
        </div>
      </article>
    `).join("")}
  `;

  const skillGroups = response.skills.reduce((groups, skill) => {
    (groups[skill.category] ??= []).push(skill.name);
    return groups;
  }, {});

  document.getElementById("skills-content").innerHTML = `
    <div class="section-heading reveal">
      <p class="section-kicker">Skills</p>
      <h2>Skills &amp; education</h2>
    </div>
    <div class="skill-groups reveal">
      ${Object.entries(skillGroups).map(([category, skills]) => `
        <div class="skill-group">
          <span class="skill-category">${category}</span>
          <ul class="skill-list">${skills.map((skill) => `<li>${skill}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
    <div class="expertise reveal reveal-delay-1">
      <h3>Core expertise</h3>
      ${response.expertise.map((item) => `<span>${item}</span>`).join("")}
    </div>
    <div class="education reveal reveal-delay-2">
      <p class="section-kicker">Education</p>
      ${response.education.map((item) => `
        <div class="education-item">
          <strong>${item.institution}</strong>
          <span>${item.qualification}, ${item.field} · ${item.classification}</span>
        </div>
      `).join("")}
    </div>
  `;

  setupScrollAnimations();
}

loadProfile();
