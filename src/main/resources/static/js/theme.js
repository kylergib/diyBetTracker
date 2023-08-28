if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  // User's system prefers dark mode
  const meta = document.createElement("meta");
  meta.name = "theme";
  meta.content = "dark";
  document.head.appendChild(meta);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "/diy-dark.css";
  link.id = "diy-styleSheet";
  document.head.appendChild(link);
  const nav = document.getElementById("topNavBar");
  console.log(nav);
  nav.classList.add("navbar-dark");
  nav.classList.add("bg-dark");
  nav.classList.remove("navbar-light");
  nav.classList.remove("bg-light");
} else {
  // User's system prefers light mode or doesn't specify a preference

  const meta = document.createElement("meta");
  meta.name = "theme";
  meta.content = "light";
  document.head.appendChild(meta);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "/diy-light.css";
  link.id = "diy-styleSheet";
  document.head.appendChild(link);
  const nav = document.getElementById("topNavBar");
  console.log(nav);
  nav.classList.remove("navbar-dark");
  nav.classList.remove("bg-dark");
  nav.classList.add("navbar-light");
  nav.classList.add("bg-light");
}
