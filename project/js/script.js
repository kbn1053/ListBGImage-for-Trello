// strage読み取り用のキーワード定数
const strage_keys = ["tlistname", "imgurl", "listsize", "alwaysmode", "scale"];

// strage読み出値を格納
let strage_data = {};

//List監視用変数 : 監視切り離しがあるのでvarで宣言
var list_observer;

////////////////
/// 主処理の定義
///////////////

// main
const listbgimage_main = () => {

  // ストレージより設定データの取得
  chrome.storage.sync.get(strage_keys, (value) => {

    //stragedataのvalidation : var データ
    strage_data = validate_stragedata(strage_keys, value);

    //strage値を元にstyleを作成と追加
    add_bgimg_style(strage_data);

    //　監視対象のTrelloのListのNodeを検索して取得する
    let targetnode = search_trello_list(strage_data.tlistname);
    //対象が無い場合は処理終了
    if (typeof (targetnode) === "undefined") {
      //console.log("対象なし");
      return;
    }

    //alwaysmode専用処理、後続処理はせずに終了する
    if (strage_data.alwaysmode === "true") {
      // alwaysmodeは背景画像を設定
      targetnode.id = "tskoverimgbg";

      return;
    }

    //　監視対象のTrelloのListのNodeがすでに空の場合は即座に背景画像を表示
    set_bgimg_now(targetnode);

    // 監視対象のTrelloのListnのNodeを監視する
    set_List_observer(targetnode);

  });
}

// 再処理 :board移動時に発生 : strageデータ読み出しなし
const listbgimage_reload = () => {
  //　監視対象のTrelloのListのNodeを検索して取得する
  let targetnode = search_trello_list(strage_data.tlistname);

  //対象が無い場合は処理終了
  if (typeof (targetnode) === "undefined") {
    //console.log("対象なし");
    return;
  }

  //alwaysmode専用処理、後続処理はせずに終了する
  if (strage_data.alwaysmode === "true") {
    // alwaysmodeは背景画像を設定
    targetnode.id = "tskoverimgbg";

    return;
  }

  //　監視対象のTrelloのListのNodeがすでに空の場合は即座に背景画像を表示
  set_bgimg_now(targetnode);

  // 監視対象のTrelloのListnのNodeを監視する
  set_List_observer(targetnode);
}

// boardの移動を監視
const set_bd_observer = () => {
  // boardの移動を監視で反応があった時の処理
  var bd_observer = new MutationObserver((mutations) => {

    //console.log("board changed");

    // List監視を停止する
    if (typeof (list_observer) !== "undefined") {
      //console.log("disconnect");
      list_observer.disconnect();
    }

    listbgimage_reload();
  });

  // boardの移動を監視：title文字の変化で検知
  bd_observer.observe(document.getElementsByTagName("title")[0], { childList: true });
}

//strageの変更を監視
const strage_change_reload = (cngobj, area) => {

  //console.log(JSON.stringify(cngobj));

  // 設定済み処理を消去
  const style = document.getElementById("tskoverimgbg_strage");
  if (style !== null && (style.sheet.cssRules.length > 0)) {
    style.sheet.deleteRule(0);
  }

  // 監視するListが複数にならないように、idを削除する
  const oldnode = document.getElementById('tskoverimgbg');
  if (oldnode !== null) {
    oldnode.removeAttribute("id");
  }

  // List監視を停止する
  if (typeof (list_observer) !== "undefined") {
    list_observer.disconnect();
  }

  listbgimage_main();

}

////////////////////////////
// 通称処理  実行
///////////////////////////
listbgimage_main();
// board移動を監視
set_bd_observer();
// strageの変更を監視
chrome.storage.onChanged.addListener(strage_change_reload);

/////////////////
///function
////////////////

// stragedataのvalidation
const validate_stragedata = (keylist, data_obj) => {

  //各データをvalidate
  keylist.map(key => {

    //console.log(key + ":" + data_obj[key]);

    if (typeof (data_obj[key]) === "undefined" || data_obj[key] === "default") {
      switch (key) {
        case "tlistname":
          data_obj[key] = "Today";
          break;
        case "imgurl":
          // 内臓リソースを読み出す
          data_obj[key] = chrome.extension.getURL('images/ocean_bed.png');
          break;
        case "listsize":
          data_obj[key] = "300";
          break;
        case "alwaysmode":
          data_obj[key] = "false";
          break;
        case "scale":
          data_obj[key] = "contain";
          break;
        default:
          //console.log("想定外");
          break;
      }
    }

  });

  //console.log(JSON.stringify(data_obj));

  return data_obj;
}

// styleの生成と追加
const add_bgimg_style = (data_obj) => {

  //strageを元にstyleを作成と追加
  const mysccrule = "#tskoverimgbg { min-height:" + data_obj.listsize + "px;" +
    "background-image: url(" + data_obj.imgurl + ");" +
    "background-size: " + data_obj.scale + ";}";

  //styleの生成と追加
  const style = document.createElement("style");
  style.setAttribute("id", "tskoverimgbg_strage");
  style.setAttribute("type", "text/css");
  document.head.appendChild(style);

  style.sheet.insertRule(mysccrule, 0);

  return;
}

// Listnodeの検索
const search_trello_list = (listname) => {

  let return_node;

  document.querySelectorAll("textarea.mod-list-name").forEach(function (value) {
    // 名称一致でNodeを検索
    if (listname === value.firstChild.nodeValue) {
      // カードリストが収まる部分のNodeを選択
      return_node = value.parentNode.nextSibling;
      //console.log("serch hit");
    }
  });

  return return_node;
}

//　監視対象のTrelloのListのNodeがすでに空の場合は即座に背景画像を表示
const set_bgimg_now = (targetnode) => {

  if (!targetnode.hasChildNodes()) {
    //子ノードが無い場合は背景画像を設定
    targetnode.id = "tskoverimgbg";
  } else {
    //子ノードがあるが、カードを追加画面のみの場合は例外的にセット
    if (targetnode.firstChild.classList.contains("card-composer")) {
      targetnode.id = "tskoverimgbg";
    } else {
      //背景画像がある(id設定状態)で子ノードある場合は、idを取り消す
      if (targetnode.id === 'tskoverimgbg') {
        targetnode.removeAttribute("id");
      }
    }
  }

  return;
}

// 監視処理をリストに追加し、カードが空になったタイミングで背景画像をセットする
const set_List_observer = (targetnode) => {

  // 監視で反応があった時の処理
  list_observer = new MutationObserver((mutations) => { set_bgimg_now(targetnode); });

  //子ノードの変化を監視開始
  list_observer.observe(targetnode, { childList: true });
}


/////////////////////////////////
//////Test
/////////////////////////////////
const validate_stlagedata_test = () => {

  //nodata
  let my_obj = {};
  validate_stragedata(strage_keys, my_obj);

  //all data
  my_obj = {
    "tlistname": "a",
    "imgurl": "b",
    "listsize": "c",
    "alwaysmode": "d",
    "scale": "e"
  }
  validate_stragedata(strage_keys, my_obj);
}