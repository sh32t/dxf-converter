/**************************************
 * モジュール
 **************************************/
const electron = require("electron");
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
//const jschardet = require("jschardet");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

/**************************************
 * 画面起動処理
 **************************************/
// メインウィンドウはガベージコレクションされないようにグローバル宣言
let mainWindow;
// Electronの初期化完了後に実行
app.on("ready", () => {

    // ブラウザを作成
    mainWindow = new BrowserWindow();
    // 初期表示でトップ画面を表示
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // ウィンドウが閉じられたらアプリも終了
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
});

/**************************************
 * アプリケーション終了処理
 **************************************/
// 全てのウィンドウが閉じたら終了
app.on("window-all-closed", () => {
    if (process.platform != "darwin") {
        app.quit();
    }
});

/**************************************
 * イベント処理
 **************************************/
// アップロード処理
ipcMain.on("uploadFile", (event, filePath, fileName) => {
    fs.copyFile(filePath, path.join(__dirname, "file", "dxf", fileName), (error) => {
        if (error) {
            console.log(error);
        }
    });
});

// 変換処理
ipcMain.on("convertButton", (event, setting) => {
    let strSetting = JSON.stringify(setting);
    console.log("convert:" + strSetting);
    let json = null;
    let child = child_process.execFile("python", ["src/py/convert.py", strSetting], (error, stdout, stderr) => {
        if (error) {
            console.log(error);
        }
        console.log(stdout);
        // 出力ファイルの読み込み
        fs.readFile("src/file/tmp.json", "utf-8", function (error, data) {
            json = JSON.parse(data);
            event.sender.send("convertComplete", json);
        });
    });
});

// エクスポート処理
ipcMain.on("exportButton", (event, filePath) => {
    console.log("export:" + filePath);
    let data = "test"
    fs.writeFile(filePath, data, function (error) {
        if (error) {
            console.log(error);
        }
    });
});
