const MAX_RECORDS_TO_FIND = 50;
const LOAD_PAGE_WAIT_TIME = 1000; // in milliseconds
const CLICK_BUTTON_WAIT_TIME = 2000; // in milliseconds
const MIN_USER_FOLLOWERS = 275000;
const PROFILES_FOUND = [];

// Checks if a string contains an email address
function hasEmail(str) {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  return emailPattern.test(str);
}

// Extracts an email address from a string
function extractEmail(text) {
  const emailRegex = /[\w-]+@([\w-]+\.)+[\w-]+/;
  const email = text.match(emailRegex)[0];
  return email;
}

// Converts a string with a suffix to a number
function convertToNumber(str) {
  const suffixes = {
    "K": 1000,
    "M": 1000000,
  };

  const lastChar = str.charAt(str.length - 1);
  const factor = suffixes[lastChar];

  if (factor) {
    const numberPart = parseFloat(str.substring(0, str.length - 1));
    return numberPart * factor;
  } else {
    return parseFloat(str);
  }
}

// Scrapes data from the TikTok search page
function scrapeData() {
  const items = document.querySelectorAll('a[data-e2e="search-user-info-container"]');
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const uniqueId = item.querySelector('*[data-e2e="search-user-unique-id"]').innerText.trim();
    const tiktokUrl = "https://www.tiktok.com/@" + uniqueId;
    const nickname = item.querySelector('*[data-e2e="search-user-nickname"]').innerText.split('·')[0].trim();
    const followCount = convertToNumber(item.querySelector('*[data-e2e="search-follow-count"]').innerText.trim())
    const description = (item.querySelector('*[data-e2e="search-user-desc"]') != undefined) ? item.querySelector('*[data-e2e="search-user-desc"]').innerText.trim() : "";

    if (hasEmail(description) && followCount >= MIN_USER_FOLLOWERS) {
      const email = extractEmail(description);
      if (!PROFILES_FOUND.some(item => item["Profile URL"] === tiktokUrl)) {
        PROFILES_FOUND.push({
          "Profile URL": tiktokUrl,
          "Email": email,
          "First Name": nickname
        });
      }
    }
  }

  if (PROFILES_FOUND.length < MAX_RECORDS_TO_FIND) {
    window.scrollTo({
      top: document.body.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });

    setTimeout(function () {
      let loadMoreBtn = document.querySelector('button[data-e2e="search-load-more"]');
      if (loadMoreBtn != null) {
        loadMoreBtn.click();
        setTimeout(function () {
          console.log("[TIKTOK EMAIL SCRAPER] next page...");
          scrapeData();
        }, LOAD_PAGE_WAIT_TIME);
      } else {
        console.log("[TIKTOK EMAIL SCRAPER] finished, no more pages to load.");
        console.log("[RESULT]", PROFILES_FOUND)
      }
    }, CLICK_BUTTON_WAIT_TIME);
  } else {
    console.log("[TIKTOK EMAIL SCRAPER] done.");
    console.log("[RESULT]", PROFILES_FOUND)
  }
};

console.clear();
console.log("[TIKTOK EMAIL SCRAPER] started...");
scrapeData();