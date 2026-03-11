# Sinister Six Chrome Theme Juggler

A Chrome extension that helps users manage and switch between Chrome themes more easily.

This project was developed for **CS 3250**. The extension allows users to store theme links, quickly switch between installed themes, and organize their collection directly from the browser popup.

---

## Features

- Toggle between the default Chrome theme and installed themes
- Save Chrome Web Store theme links to a personal collection
- Randomly select a theme from your saved collection
- Sort saved themes:
  - Alphabetically
  - Recently added
  - Recently used
- Quickly open themes in the Chrome Web Store
- Remove individual themes or clear the entire collection

---

## Installing the Extension (Development)

1. Clone the repository:
git clone https://github.com/CS-3250-SinisterSix/Sinister-Six-Chrome-Extension.git


2. Open Chrome and navigate to:
chrome://extensions


3. Enable **Developer Mode** (top right).

4. Click **Load unpacked**.

5. Select the project folder.

The extension should now appear in your Chrome toolbar.

---

## Running Tests

This project uses **Jest** for unit testing.

Install dependencies:
npm install

Run Tests:
npm test

Run tests with coverage:
npm test -- --coverage

---

## Project Structure
src/
chromeThemes.js Chrome theme API interaction
chromeThemes.test.js Tests for chrome theme utilities

popupLogic.js Pure logic used by the popup
popupLogic.test.js Jest tests for popup logic

themes.js Theme state management
themes.test.js Tests for theme state

ui.js Popup UI utilities

popup.js Popup controller logic
popup.html Extension popup UI
manifest.json Chrome extension configuration

---

## Technologies Used

- JavaScript
- Chrome Extension APIs
- Jest
- Node.js

---

## License

This project was developed for educational purposes as part of CS 3250.
