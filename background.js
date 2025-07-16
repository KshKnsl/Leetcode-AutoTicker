
// Use browser-polyfill for cross-browser compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}

browser.action.onClicked.addListener(() => {
    browser.tabs.query({}).then((tabs) => {
        tabs.forEach(tab => {
            browser.tabs.sendMessage(tab.id, { type: "refreshLeetcodeSolved" });
        });
    });
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getSolvedQuestions') {
        fetch('https://leetcode.com/api/problems/all/')
            .then(resp => resp.json())
            .then(data => {
                console.log('Fetched solved questions:', data);
                const solved = data.stat_status_pairs
                    .filter(q => q.status === 'ac')
                    .map(q => q.stat.question__title_slug);
                sendResponse({ solved });
            })
            .catch(() => sendResponse({ solved: [] }));
        return true;
    }
    return false;
});
