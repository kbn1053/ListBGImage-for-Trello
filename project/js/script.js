// local_strage上書き用のstyleをコード上で生成
// popup経由で再呼び出しされると変数定義const/letを利用していると再宣言されエラーになる。
// var宣言するしかない

var style = document.getElementById("tskoverimgbg_strage");

if (style === null) {
  style = document.createElement("style");
  style.setAttribute("id", "tskoverimgbg_strage");
  document.head.appendChild(style);
  var sheet = style.sheet;

  // 監視用変数
  var observer;
} else {
  // popup経由の再読み込み処理
  //ruleを削除
  var sheet = style.sheet;
  sheet.deleteRule(0);

  // 監視するListが複数にならないように、idを削除する
  const oldnode = document.getElementById('tskoverimgbg');
  if (oldnode !== null) {
    oldnode.removeAttribute("id");
  }

  //監視を停止する
  if (typeof (observer) !== "undefined") {
    //console.log("disconnect");
    observer.disconnect();
  }
}

// ストレージより設定データの取得
chrome.storage.sync.get(["tlistname", "imgurl", "listsize", "alwaysmode", "scale"], (value) => {

  // console.log("strage " + value.tlistname + ":"
  //   + value.imgurl + ":"
  //   + value.listsize + ":"
  //   + value.alwaysmode + ":"
  //   + value.scale + ":");

  let tlistname;
  let imgurl;
  let listsize;
  let alwaysmode;
  let scale;

  //入力値のバリデーション
  if (typeof (value.tlistname) === "undefined" || value.tlistname === "default") {
    tlistname = "Today"; // default
  } else {
    tlistname = value.tlistname;
  }

  if (typeof (value.imgurl) === "undefined" || value.imgurl === "default") {
    imgurl = chrome.extension.getURL('images/ocean_bed.png'); // default
  } else {
    imgurl = value.imgurl;
  }

  if (typeof (value.listsize) === "undefined" || value.listsize === "default") {
    listsize = "300"; // default
  } else {
    listsize = value.listsize;
  }

  if (typeof (value.alwaysmode) === "undefined") {
    alwaysmode = false; // default
  } else {
    // local strageは文字しか保存できないのでbooleanに変換する
    if (value.alwaysmode === "true") {
      alwaysmode = true;
    } else {
      alwaysmode = false;
    }
  }

  if (typeof (value.scale) === "undefined" || value.scale === "default") {
    scale = "contain"; // default
  } else {
    scale = value.scale;
  }

  //設定値のstyleを追加
  const mysccrule = "#tskoverimgbg { min-height:" + listsize + "px;" +
    "background-image: url(" + imgurl + ");" +
    "background-size: " + scale + ";}"
  sheet.insertRule(mysccrule, 0);

  //　監視対象のTrelloのListの名前Divを検索して取得する
  let targetListNode;
  document.querySelectorAll("textarea.mod-list-name").forEach(function (value) {
    if (tlistname === value.firstChild.nodeValue) {
      targetListNode = value.parentNode.nextSibling; // カードリストが収まるDIVを選択
    }
  });

  if (typeof (targetListNode) === "undefined") {
    //対象が無い場合は終了
    return;
  }

  // 現状でTrelloのカードが全て空の場合または、alwaysmodeはすぐに背景画像をセットする
  //子ノードがあるが、カードを追加画面のみの場合は即座に背景画像セット
  //子ノードがあるが上記以外: nothing to do
  //子ノードが無い場合は背景画像を設定＝idを設定
  if (alwaysmode) {
    targetListNode.id = "tskoverimgbg";
    //即座に終了
    return;
  }
  else if (targetListNode.hasChildNodes()) {
    if (targetListNode.firstChild.classList.contains("card-composer")) {
      targetListNode.id = "tskoverimgbg";
    }
  } else {
    targetListNode.id = "tskoverimgbg";
  }

  // 監視処理をリストに追加し、カードが空になったタイミングで背景画像をセットする
  // var observerで定義し、外部から停止できるようにする
  observer = new MutationObserver((mutations) => {
    //子ノードがある場合
    if (targetListNode.hasChildNodes()) {
      //カードを追加画面のみの場合
      if (targetListNode.firstChild.classList.contains("card-composer")) {
        //console.log("only composer");
        targetListNode.id = "tskoverimgbg";
      } else {
        //背景画像がある(id設定状態)で子ノードある場合は、idを取り消す
        if (targetListNode.id === 'tskoverimgbg') {
          targetListNode.removeAttribute("id");
        }
      }
    } else {
      //子ノードが無い場合は背景画像を設定＝idを設定
      //console.log("nochiled");
      targetListNode.id = "tskoverimgbg";
    }

  });

  // 監視を開始 : 子ノードに変化があれば関数実行される
  observer.observe(targetListNode, { childList: true });

});




