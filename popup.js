document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("myButton");
  const title = document.getElementById("title");
  const text = document.getElementById("text2");

  if (!button || !title) {
    console.error("Element not found");
    return;
  }

  button.addEventListener("click", async () => {
    const extensions = await chrome.management.getAll();

    // Example: find the first enabled extension
    const enabledExtension = extensions.find(
      (ext) => ext.type === "theme" && ext.enabled,
    );

    const disabledExtension = extensions.find(
      (ext) => ext.type === "theme" && ext.disabled,
    );

    title.textContent = enabledExtension
      ? enabledExtension.name
      : "No enabled themes found";

    text2.textContent = enabledExtension
      ? enabledExtension.version
      : "No disabled themes found";

    chrome.theme.update(
      {
        colors: {
          frame: [255, 0, 0], // RGB for red
          toolbar: [255, 200, 200], // optional
          tab_text: [255, 255, 255],
        },
        images: {}, // optional
        tints: {}, // optional
        properties: {}, // optional
      },
      () => {
        console.log("Theme applied!");
      },
    );
  });
});
