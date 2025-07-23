/**
 * Instagram Mass Auto-Unliker Script (2025 Edition)
 * --------------------------------------------------
 * License: MIT
 *
 * Description:
 * This script automates the process of unliking all posts from a user's
 * "Your Activity > Likes" page on Instagram. It operates by selecting
 * multiple liked posts in batches and triggering the "Unlike" action.
 *
 * Usage:
 * 1. Set your Instagram UI language to English.
 * 2. Navigate to: https://www.instagram.com/your_activity/interactions/likes
 * 3. Open your browser's Developer Console:
 *    - Windows/Linux: Ctrl + Shift + J
 *    - macOS: Cmd + Option + J
 * 4. Paste the script into the console and press Enter.
 *
 * Notes:
 * - Works best in Google Chrome.
 * - Be patient with batch processing to avoid Instagram rate-limiting.
 * - The script attempts to scroll and load more liked posts as needed.
 *
 * Disclaimer:
 * This script interacts directly with Instagram’s front-end UI.
 * If Instagram updates its DOM structure, this script may stop functioning.
 * Use responsibly and at your own risk.
 */

(async function () {
  const UNLIKE_BATCH_SIZE = 100;
  const DELAY_BETWEEN_ACTIONS_MS = 1500;
  const DELAY_BETWEEN_CHECKBOX_CLICKS_MS = 300;
  const MAX_RETRIES = 60;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const clickElement = async (element) => {
    if (!element) throw new Error('Element not found');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.click();
  };

  const scrollAndWaitForMoreLikes = async (previousCount) => {
    window.scrollTo(0, document.body.scrollHeight);
    for (let i = 0; i < 10; i++) {
      await delay(1000);
      const currentCount = document.querySelectorAll('[aria-label="Toggle checkbox"]').length;
      if (currentCount > previousCount) return true;
    }
    return false;
  };

  const unlikeSelectedPosts = async () => {
    try {
      const unlikeButton = [...document.querySelectorAll('span')].find((el) =>
        ['Unlike', 'Remove Like'].includes(el.textContent.trim())
      );

      if (!unlikeButton) throw new Error('Unlike button not found');
      await clickElement(unlikeButton);
    } catch (error) {
      console.error('Error during unliking:', error.message);
    }
  };

  const unlikeActivity = async () => {
    try {
      while (true) {
        const [, selectButton] = document.querySelectorAll('[role="button"]');
        if (!selectButton) throw new Error('Select button not found');
        await clickElement(selectButton);
        await delay(3000);

        let checkboxes = document.querySelectorAll('[aria-label="Toggle checkbox"]');
        if (checkboxes.length === 0) {
          const gotMore = await scrollAndWaitForMoreLikes(0);
          if (!gotMore) {
            console.log(' No more liked posts to process.');
            break;
          }
          continue;
        }

        for (let i = 0; i < Math.min(UNLIKE_BATCH_SIZE, checkboxes.length); i++) {
          await clickElement(checkboxes[i]);
          await delay(DELAY_BETWEEN_CHECKBOX_CLICKS_MS);
        }

        await delay(DELAY_BETWEEN_ACTIONS_MS);
        await unlikeSelectedPosts();
        await delay(DELAY_BETWEEN_ACTIONS_MS);
      }
    } catch (error) {
      console.error('Error in unlikeActivity:', error.message);
    }
  };

  // Start script
  try {
    console.log("Starting to unlike liked posts...");
    await unlikeActivity();
    console.log('All liked posts unliked or none left to unlike.');
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
})(); 
