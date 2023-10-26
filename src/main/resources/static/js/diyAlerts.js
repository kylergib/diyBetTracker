export async function createAlert(text, type = "primary") {
  //   switch (type) {
  //     case "primary":
  //       break;
  //     case "secondary":
  //       break;
  //     case "success":
  //       break;
  //   }

  const div = document.createElement("div");
  div.classList.add("alert", "alert-" + type, "diy-alert");
  div.textContent = text;
  document.getElementById("diyAlert").appendChild(div);
  dismissAlert(div);
}

async function dismissAlert(div, time = 3000) {
  setTimeout(() => {
    div.remove();
  }, time);
}
