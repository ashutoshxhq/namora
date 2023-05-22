// oninstall open options page
chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.openOptionsPage();
    }
);