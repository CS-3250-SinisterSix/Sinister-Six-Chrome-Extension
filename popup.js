import { makeLink } from "./src/themes.js";

document.addEventListener("DOMContentLoaded", async () => {
  const button = document.getElementById("myButton");
  const link = document.getElementById("link");
  const clearButton = document.getElementById("clear");
  const add = document.getElementById("add");
  const title = document.getElementById("title");
  const text = document.getElementById("text2");

  if (!button || !title) {
    console.error("Element not found");
    return;
  }

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

  const result = await chrome.storage.local.get(["links"]);
  const themeLinks = result.links || [];

  console.log("Total links:", themeLinks.length);

  button.addEventListener("click", async () => {
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
      disabledExtension = enabledExtension;
    } else {
      // enable theme if the installed theme is inactive
      chrome.management.setEnabled(disabledExtension.id, true, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log(disabledExtension);
        }
      });

      themeToDisplay = disabledExtension;
      disabledExtension = null;
    }

    title.textContent = themeToDisplay
      ? themeToDisplay.name
      : "No enabled themes found";
  });

  link.addEventListener("click", () => {
    window.open(themeLinks[0], "_blank", "noopener");
  });
  add.addEventListener("click", async () => {
    text.textContent = makeLink(enabledExtension.name, enabledExtension.id);
    const newLink = makeLink(enabledExtension.name, enabledExtension.id);

    if (!themeLinks.includes(newLink)) {
      themeLinks.push(newLink);
      await chrome.storage.local.set({ links: themeLinks });
    }
  });
  clearButton.addEventListener("click", async () => {
    await chrome.storage.local.clear();
    console.log("Storage cleared");
  });
});
