/**
 * Displays a the confirm card
 *
 * @description Displays a confirm card with a configurable message and two buttons for user input
 * @returns {Promise<void>}
 *
 * @example
 * await showConfirm('This will remove all themes from your collection. Are you sure you want to continue?')
 */
export function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const msg = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    msg.textContent = message;
    modal.hidden = false;

    function cleanup(result) {
      modal.hidden = true;
      yesBtn.removeEventListener('click', yesHandler);
      noBtn.removeEventListener('click', noHandler);
      resolve(result);
    }

    function yesHandler() {
      cleanup(true);
    }

    function noHandler() {
      cleanup(false);
    }

    yesBtn.addEventListener('click', yesHandler);
    noBtn.addEventListener('click', noHandler);
  });
}
