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
        // �t�@�C���A�b�v���[�h����
        ipcRenderer.send(this.id, filePath, uploadFileName);
    });

    // �t�@�C���ϊ�
    $("#convertButton").click(function () {
        let setting = {};
        console.log($("#intervalText").val());
        setting.interval = numberValue($("#intervalText").val());
        setting.width = numberValue($("#widthText").val());
        setting.angle = numberValue($("#angleText").val());
        console.log(setting);
        setting.file = uploadFileName;

        // �t�@�C���ϊ�����
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
        let id = this.id;

        // �ۑ��_�C�A���O��\��
        dialog.showSaveDialog(window, options, function (filePath) {
            console.log("filePath:" + filePath);
            if (filePath) {
                console.log("id:" + id);
                // �t�@�C���G�N�X�|�[�g����
                ipcRenderer.send(id, filePath);
            }
        });
    });
});

// �����^���l�ɕϊ�
var numberValue = function (value) {
    if (isNaN(value) || value === "" || value === null) {
        return 0;
    } else {
        return parseFloat(value);
    }
};