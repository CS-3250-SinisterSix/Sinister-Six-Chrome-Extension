document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("myButton");
  const button2 = document.getElementById("link");
  const title = document.getElementById("title");
  const text = document.getElementById("text2");

  const themeLink =
    "https://chromewebstore.google.com/detail/pikmin-theme/bpmkhflicgoklmheccmojdbipcbmhcjg?utm_source=ext_app_menu";

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
      } else if (extensions[i].type === "theme") {
        console.log(extensions[i].name);
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
      for (let i = 0; i < extensions.length; i++) {
        if (extensions[i].type === "theme" && !extensions[i].enabled) {
          disabledExtension2 = extensions[0];
          console.log(extensions[0]);
        }
      }
    }

    title.textContent = enabledExtension
      ? enabledExtension.name
      : "No enabled themes found";

    text.textContent = disabledExtension
      ? disabledExtension.name
      : "No disabled themes found";
  });
  button2.addEventListener("click", async () => {
    window.open(themeLink, "_blank", "noopener");

    for (let i = 0; i < extensions.length; i++) {
      if (extensions[i].type === "theme" && !extensions[i].enabled) {
        disabledExtension = extensions[i];
      }
    }
  });
});
