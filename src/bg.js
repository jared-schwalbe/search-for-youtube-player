// listen for when a tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo && changeInfo.status == 'complete') {
        chrome.tabs.sendMessage(tabId, { data: tab });
    }
});
