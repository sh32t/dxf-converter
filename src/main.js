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
    fs.copyFile(filePath, path.join(__dirname, "file", "dxf", fileName), (err) => {
        if (err) {
            console.log(err);
        }
    });
});

// エクスポート処理
ipcMain.on("exportButton", (event, filePath) => {
    let data = "test"
    fs.writeFile(filePath, data, function (err) {
        if (err) {
            return console.log(err);
        }
    });
});
