export function setTheme(theme) {
  if (theme == "dark") {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "/diy-dark.css";
    link.id = "diy-styleSheet";
    document.head.appendChild(link);
  } else {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "/diy-light.css";
    link.id = "diy-styleSheet";
    document.head.appendChild(link);
  }
}
