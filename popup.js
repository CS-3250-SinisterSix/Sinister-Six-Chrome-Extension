document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("myButton");
  const title = document.getElementById("title");

  if (!button || !title) {
    console.error("Element not found");
    return;
  }

  button.addEventListener("click", async () => {
    const extensions = await chrome.management.getAll();

    // Example: find the first enabled extension
    const enabledExtension = extensions.find(ext => ext.type === "theme" && ext.enabled);

    title.textContent = enabledExtension
      ? enabledExtension.name
      : "No enabled extensions found";
  });
});