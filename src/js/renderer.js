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

    // キャンバスのセットアップ
    Canvas.setUpCanvas();

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

        // 変換処理完了
        ratio = numberValue($("#ratioText").val()) / 100;
        ipcRenderer.on("centerJson", (event, json) => {
            Canvas.setCenterJson(json);
            Canvas.viewDot(ratio);
        })
        ipcRenderer.on("outJson", (event, json) => {
            Canvas.setOutJson(json);
            Canvas.viewDot(ratio);
        })
        ipcRenderer.on("inJson", (event, json) => {
            Canvas.setInJson(json);
            Canvas.viewDot(ratio);
        })
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

    // 表示倍率変更
    $("#ratioText").change(function () {
        ratio = numberValue($("#ratioText").val()) / 100;
        Canvas.viewDot(ratio);
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

// キャンバス
var Canvas = {

    // キャンバスのセットアップ
    setUpCanvas: function (json, ratio) {
        this.canvas = document.getElementById("canvas");
        this.canvasContext = this.canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;

        this.baseX = this.width / 2;
        this.baseY = this.height / 2;
        this.drawBaseLine();
    },

    setCenterJson: function (json) {
        this.centerJson = json;
    },

    setOutJson: function (json) {
        this.outJson = json;
    },

    setInJson: function (json) {
        this.inJson = json;
    },

    // 変換した座標を表示
    viewDot: function (ratio) {
        Canvas.allClear();
        for (var i in this.centerJson) {
            Canvas.drawDot(this.centerJson[i][0], this.centerJson[i][1], ratio);
        }
        for (var i in this.outJson) {
            Canvas.drawDot(this.outJson[i][0], this.outJson[i][1], ratio);
        }
        for (var i in this.inJson) {
            Canvas.drawDot(this.inJson[i][0], this.inJson[i][1], ratio);
        }
    },

    // 座標に点を打つ
    drawDot: function (x, y, ratio) {
        this.canvasContext.beginPath();
        this.canvasContext.arc(x * ratio + this.baseX, y * ratio + this.baseY, 1, 0, Math.PI * 2, false);
        this.canvasContext.fill();
    },

    // 基準線を描く
    drawBaseLine: function () {
        this.lineAToB(this.baseX, 0, this.baseX, this.height);
        this.lineAToB(0, this.baseY, this.width, this.baseY);
    },

    // AからBへ線を描く
    lineAToB: function (ax, ay, bx, by) {
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(ax, ay);
        this.canvasContext.lineTo(bx, by);
        this.canvasContext.stroke();
    },

    allClear: function () {
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        this.drawBaseLine();
    },
};
