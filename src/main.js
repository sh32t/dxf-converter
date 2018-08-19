/**************************************
 * ���W���[��
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
 * ��ʋN������
 **************************************/
// ���C���E�B���h�E�̓K�x�[�W�R���N�V��������Ȃ��悤�ɃO���[�o���錾
let mainWindow;
// Electron�̏�����������Ɏ��s
app.on("ready", () => {

    // �u���E�U���쐬
    mainWindow = new BrowserWindow();
    // �����\���Ńg�b�v��ʂ�\��
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // �E�B���h�E������ꂽ��A�v�����I��
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
});

/**************************************
 * �A�v���P�[�V�����I������
 **************************************/
// �S�ẴE�B���h�E��������I��
app.on("window-all-closed", () => {
    if (process.platform != "darwin") {
        app.quit();
    }
});

/**************************************
 * �C�x���g����
 **************************************/
// �A�b�v���[�h����
ipcMain.on("uploadFile", (event, filePath, fileName) => {
    fs.copyFile(filePath, path.join(__dirname, "file", "dxf", fileName), (err) => {
        if (err) {
            console.log(err);
        }
    });
});

// �G�N�X�|�[�g����
ipcMain.on("exportButton", (event, filePath) => {
    let data = "test"
    fs.writeFile(filePath, data, function (err) {
        if (err) {
            return console.log(err);
        }
    });
});
