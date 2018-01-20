// popup有効化処理 
//https://qiita.com/NewGyu/items/8878ebc392803b0b1cd0
//https://qiita.com/Tachibana446/items/ab15021099d54d1209c2
chrome.runtime.onMessage.addListener((request, sender, callback) => {  // 1

  chrome.pageAction.show(sender.tab.id);
  callback(sender.tab.id);
  //console.log("test"); // donot work..

  return true;
});
