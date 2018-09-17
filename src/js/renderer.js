/**************************************
 * ���W���[��
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

    // �t�@�C���A�b�v���[�h
    var uploadFileName = ""
    $("#uploadFile").change(function () {
        let file = this.files[0];
        let filePath = file.path;
        uploadFileName = file.name;
        ipcRenderer.send(this.id, filePath, uploadFileName);
    });

    // �t�@�C���ϊ�
    $("#convertButton").click(function () {
        let setting = {};
        setting.interval = intValue($("#intervalText").val());
        setting.width = intValue($("#widthText").val());
        setting.angle = intValue($("#angleText").val());
        setting.file = uploadFileName;

        ipcRenderer.send(this.id, setting);
    });

    // �t�@�C���G�N�X�|�[�g
    $("#exportButton").click(function () {
        let fileName = uploadFileName.split(".")[0] + dateformat(new Date(), "_yyyyMMddHHMMss");
        let window = remote.getCurrentWindow();
        let options = {
            title: "�ϊ��t�@�C���o��",
            filters: [
                { name: "�h�L�������g", extensions: ["txt"] },
            ],
            defaultPath: path.join(__dirname, "file", "txt", fileName),
            properties: ["openFile", "createDirectory"]
        };
        dialog.showSaveDialog(window, options, function (filePath) {
            if (filePath) {
                ipcRenderer.send(this.id, filePath);
            }
        });
    });
});


var intValue = function (value) {
    if (isNaN(value) || value === "" || value === null) {
        return 0;
    } else {
        return parseInt(value);
    }
};