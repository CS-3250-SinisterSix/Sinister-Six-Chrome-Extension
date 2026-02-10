document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("myButton");
  const button2 = document.getElementById("button2");
  const title = document.getElementById("title");
  const text = document.getElementById("text2");

  if (!button || !title) {
    console.error("Element not found");
    return;
  }

  button.addEventListener("click", async () => {
    const extensions = await chrome.management.getAll();
    var disabledExtension = null;
    for (let i = 0; i < extensions.length; i++) {
      if (extensions[i].type === "theme" && !extensions[i].enabled) {
        disabledExtension = extensions[i];
      }
    }

    var enabledExtension = extensions.find(
      (ext) => ext.type === "theme" && ext.enabled,
    );

    if (disabledExtension == null) {
      disabledExtension = enabledExtension;
      chrome.management.setEnabled(enabledExtension.id, false, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Extension enabled!");
        }
      });
      enabledExtension = null;
    } else {
      enabledExtension = disabledExtension;
      chrome.management.setEnabled(disabledExtension.id, true, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Extension enabled!");
        }
      });
      disabledExtension = null;
    }

    title.textContent = enabledExtension
      ? enabledExtension.name
      : "No enabled themes found";

    text.textContent = enabledExtension
      ? disabledExtension.name
      : "No disabled themes found";
  });
});
