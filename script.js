const toggleThemeEl = document.querySelector(".toggle-theme");
const filterTabsEl = document.querySelectorAll(".filter-tab");
const extensionsEl = document.querySelector(".extensions");
const dailog = document.querySelector(".modal");
const cancelBtn = document.querySelector(".cancel-btn");
const deleteBtn = document.querySelector(".delete-btn");

let extensions = [];
let selectedFilter = "All";
let extensionName = "";

const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

let theme = savedTheme || (prefersDark ? "dark" : "light");

document.documentElement.setAttribute("data-theme", theme);

function toggleTheme() {
  theme =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  toggleThemeEl.blur();
}

toggleThemeEl.addEventListener("click", toggleTheme);

cancelBtn.addEventListener("click", () => dailog.close());
deleteBtn.addEventListener("click", handleDeleteExtension);

function handleDeleteExtension(e) {
  extensions = extensions.filter(
    (extension) => extension.name !== extensionName
  );
  dailog.close();
  renderExtensions();
  return;
}

async function fetchExtensions() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) {
      throw new Error("Network error");
    }
    const data = await response.json();

    extensions = data;

    renderExtensions();
  } catch (error) {
    console.error("error", error);
  }
}

extensionsEl.addEventListener("click", handleExtensionActions);
extensionsEl.addEventListener("change", handleExtensionActions);

function handleExtensionActions(e) {
  const { target } = e;

  const selectedExtension = target.closest(".extension");
  extensionName =
    selectedExtension.querySelector(".extension__name").textContent;
  const toggleSwithEl = selectedExtension.querySelector(".toggle-switch");

  if (target.classList.contains("remove-btn")) {
    dailog.showModal();
    return;
  }

  toggleSwithEl.addEventListener("click", () => {
    const extension = extensions.find((ext) => ext.name === extensionName);

    extension.isActive = !extension.isActive;

    setTimeout(() => {
      renderExtensions();
    }, 300);
    return;
  });
}

function renderExtensions() {
  const filtered = filterExtensions();
  extensionsEl.innerHTML = "";
  filtered.forEach((extension) => {
    const extensionHTML = `
    <article class="extension">
      <div class="extension__info">
        <img
          class="extension__icon"
          src=${extension.logo}
          alt=${extension.name}
        />
        <div class="extension__details">
          <h2 class="extension__name">${extension.name}</h2>
          <p class="extension__description">${extension.description}</p>
        </div>
      </div>
      <div class="extension__actions">
        <button class="remove-btn">Remove</button>
        <label class="toggle">
          <input type="checkbox" class="toggle-switch" ${
            extension.isActive ? "checked" : ""
          }/>
          <span class="slider"></span>
        </label>
      </div>
    </article>`;

    extensionsEl.insertAdjacentHTML("afterbegin", extensionHTML);
  });
}

function filterExtensions() {
  switch (selectedFilter) {
    case "Active":
      return extensions.filter((extension) => extension.isActive);
    case "Inactive":
      return extensions.filter((extension) => !extension.isActive);
    default:
      return extensions;
  }
}

filterTabsEl.forEach((tab) => {
  tab.addEventListener("click", function () {
    filterTabsEl.forEach((t) => t.classList.remove("active"));
    this.classList.add("active");
    selectedFilter = this.textContent;
    tab.blur();
    renderExtensions();
  });
});

fetchExtensions();
