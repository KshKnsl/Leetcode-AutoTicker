chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { type: "refreshLeetcodeSolved" });
        });
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
});
