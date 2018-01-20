// popup有効化処理 :https://teratail.com/questions/109480
// TODO tabのupdateを監視するので若干負荷あり : メッセージングで対応したほうがよさそうだが
function checkUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf('https://trello.com') == 0) {
    chrome.pageAction.show(tabId);
  }
};

chrome.tabs.onUpdated.addListener(checkUrl);