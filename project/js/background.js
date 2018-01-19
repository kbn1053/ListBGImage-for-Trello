/* popup有効化処理 : https://teratail.com/questions/109480 */

new Promise(resolve => {
  // インストール時とアップデート時に実行
  chrome.runtime.onInstalled.addListener(resolve)
}).then(() => {
  return new Promise(resolve => {
    // 元のルールを削除した上で、
    chrome.declarativeContent.onPageChanged.removeRules(undefined, resolve)
  })
}).then(() => {
  // 再度新しいルールを設定する
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          hostEquals: 'trello.com',  // 対象のURLを指定
          schemes: ['https']
        }
      })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
  }])
})