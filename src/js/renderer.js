/**************************************
 * モジュール
 **************************************/
const $ = require("jquery");
const electron = require("electron");
const dateformat = require("dateformat");
const fs = require('fs');
const path = require("path");
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;
const dialog = remote.dialog;

/**************************************
 * JQuery
 **************************************/
$(function () {

    // ファイルアップロード
    var uploadFileName = ""
    $("#uploadFile").change(function () {
        let file = this.files[0];
        let filePath = file.path;
        uploadFileName = file.name;
        // ファイルアップロード処理
        ipcRenderer.send(this.id, filePath, uploadFileName);
    });

    // ファイル変換
    $("#convertButton").click(function () {
        let setting = {};
        console.log($("#intervalText").val());
        setting.interval = numberValue($("#intervalText").val());
        setting.width = numberValue($("#widthText").val());
        setting.angle = numberValue($("#angleText").val());
        console.log(setting);
        setting.file = uploadFileName;

        // ファイル変換処理
        ipcRenderer.send(this.id, setting);
    });

    // ファイルエクスポート
    $("#exportButton").click(function () {
        let fileName = uploadFileName.split(".")[0] + dateformat(new Date(), "_yyyyMMddHHMMss");
        let window = remote.getCurrentWindow();
        let options = {
            title: "変換ファイル出力",
            filters: [
                { name: "ドキュメント", extensions: ["txt"] },
            ],
            defaultPath: path.join(__dirname, "file", "txt", fileName),
            properties: ["openFile", "createDirectory"]
        };
        let id = this.id;

        // 保存ダイアログを表示
        dialog.showSaveDialog(window, options, function (filePath) {
            console.log("filePath:" + filePath);
            if (filePath) {
                console.log("id:" + id);
                // ファイルエクスポート処理
                ipcRenderer.send(id, filePath);
            }
        });
    });
});

// 整数型数値に変換
var numberValue = function (value) {
    if (isNaN(value) || value === "" || value === null) {
        return 0;
    } else {
        return parseFloat(value);
    }
};