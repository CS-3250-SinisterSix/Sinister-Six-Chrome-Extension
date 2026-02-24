document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("myButton");
  const button2 = document.getElementById("link");
  const title = document.getElementById("title");

  const themeLink =
    "https://chromewebstore.google.com/detail/pikmin-theme/bpmkhflicgoklmheccmojdbipcbmhcjg?utm_source=ext_app_menu";

  if (!button || !title) {
    console.error("Element not found");
    return;
  }

  button.addEventListener("click", async () => {
    const extensions = await chrome.management.getAll();

    let disabledExtension = null;

    for (let i = 0; i < extensions.length; i++) {
      if (extensions[i].type === "theme" && !extensions[i].enabled) {
        disabledExtension = extensions[i];
      } else if (extensions[i].type === "theme") {
        console.log(extensions[i].name);
      }
    }

    const enabledExtension = extensions.find(
      (ext) => ext.type === "theme" && ext.enabled,
    );

    if (!enabledExtension && !disabledExtension) {
      title.textContent = "No themes found";
      return;
    }

    if (disabledExtension == null) {
      // Disable currently enabled theme
      chrome.management.setEnabled(enabledExtension.id, false, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Extension disabled!");
          title.textContent = "No enabled themes found";
        }
      });
    } else {
      // Enable inactive installed theme
      chrome.management.setEnabled(disabledExtension.id, true, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Extension enabled!");
          title.textContent = disabledExtension.name;
        }
      });
    }
  });

  button2.addEventListener("click", () => {
    window.open(themeLink, "_blank", "noopener");
  });
});