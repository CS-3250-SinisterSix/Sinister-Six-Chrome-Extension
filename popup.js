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

    // We'll decide what to show in the UI without "nulling out" vars
    let themeToDisplay;

    if (disabledExtension == null) {
      // disable theme if there is currently a theme enabled
      if (enabledExtension) {
        chrome.management.setEnabled(enabledExtension.id, false, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            console.log("Extension disabled!");
          }
        });
      }
      themeToDisplay = null;
    } else {
      // enable theme if the installed theme is inactive
      chrome.management.setEnabled(disabledExtension.id, true, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Extension enabled!");
        }
      });
      themeToDisplay = disabledExtension;
    }

    title.textContent = themeToDisplay
      ? themeToDisplay.name
      : "No enabled themes found";
  });

  button2.addEventListener("click", () => {
    window.open(themeLink, "_blank", "noopener");
  });
});