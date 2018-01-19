//現在設定読み出し
const tlistname_default = "Today";
const imgurl_default = "default";
const listsize_default = "300";
const alwaysmode_default = false;
const scale_default = "contain";

const tlistname = document.getElementById("listname");
const imgurl = document.getElementById("imgurl");
const listsize = document.getElementById("listheight");
const alwaysmode = document.getElementById("alwaysmode");
const scale = document.getElementById("scale");

// ストレージの現在値を読み出し
chrome.storage.sync.get(["tlistname", "imgurl", "listsize", "alwaysmode", "scale"], (value) => {
  // console.log("strage " + value.tlistname + ":"
  //   + value.imgurl + ":"
  //   + value.listsize + ":"
  //   + value.alwaysmode + ":"
  //   + value.scale + ":");

  if (typeof (value.tlistname) === "undefined") {
    tlistname.value = tlistname_default;
  } else {
    tlistname.value = value.tlistname;
  }

  if (typeof (value.imgurl) === "undefined") {
    imgurl.value = imgurl_default;
  } else {
    imgurl.value = value.imgurl;
  }

  if (typeof (value.listsize) === "undefined") {
    listsize.value = listsize_default;
  } else {
    listsize.value = value.listsize;
  }

  if (typeof (value.alwaysmode) === "undefined") {
    alwaysmode.checked = alwaysmode_default;
  } else {
    if (value.alwaysmode === "true") {
      alwaysmode.checked = true;
    } else {
      alwaysmode.checked = false;
    }
  }

  if (typeof (value.scale) === "undefined") {
    scale.value = scale_default;
  } else {
    scale.value = value.scale;
  }

});


//保存ボタンの処理
const save = () => {

  // 入力値のヴァリデーション
  let str_tlistname = tlistname.value;
  let str_imgurl = imgurl.value;
  let str_listsize = listsize.value;
  let str_alwaysmode = String(alwaysmode.checked);
  let str_scale = scale.value;

  if (str_tlistname.length === 0) {
    //console.log("set default of tlistname");
    str_tlistname = tlistname_default;
  }

  if (str_imgurl.length === 0) {
    //console.log("set default of imgurl");
    str_imgurl = imgurl_default;
  }

  if (str_listsize.length === 0 || str_listsize.match(/[^0-9]/g)) {
    //console.log("set default of listsize");
    str_listsize = listsize_default;
  }

  if (str_scale.length === 0) {
    //console.log("set default of scale");
    str_scale = scale_default;
  }

  chrome.storage.sync.set(
    {
      'tlistname': str_tlistname, 'imgurl': str_imgurl, 'listsize': str_listsize,
      'alwaysmode': str_alwaysmode, 'scale': str_scale
    },
    () => {
      const comment = document.getElementById("comment");
      comment.innerHTML = "Saved & Load New Settings!"

      //Trelloページにjsを再読み込みさせる
      chrome.tabs.query({ url: "https://trello.com/*" }, (tabs) => {
        const tabID = tabs[0].id;
        if (tabID === undefined) {
          return;
        }

        chrome.tabs.executeScript(tabID, { file: "js/script.js" }, (result) => {
          //console.log("script reload");
        });
      });
    });
};

document.getElementById("Save").addEventListener("click", save);

//defaultボタンの処理
const setdefault = () => {
  tlistname.value = tlistname_default;
  imgurl.value = imgurl_default;
  listsize.value = listsize_default;

  alwaysmode.checked = alwaysmode_default;
  scale.value = scale_default;
}

document.getElementById("setdefault").addEventListener("click", setdefault);


