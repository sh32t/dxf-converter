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
    fs.copyFile(filePath, path.join(__dirname, "file", "dxf", fileName), (error) => {
        if (error) {
            console.log(error);
        }
    });
});

// �ϊ�����
ipcMain.on("convertButton", (event, setting) => {
    let strSetting = JSON.stringify(setting);
    console.log("convert:" + strSetting);
    let json = null;
    let child = child_process.execFile("python", ["src/py/convert.py", strSetting], (error, stdout, stderr) => {
        if (error) {
            console.log(error);
        }
        console.log(stdout);
        // �o�̓t�@�C���̓ǂݍ���
        fs.readFile("src/file/tmp.json", "utf-8", function (error, data) {
            json = JSON.parse(data);
            event.sender.send("convertComplete", json);
        });
    });
});

// �G�N�X�|�[�g����
ipcMain.on("exportButton", (event, filePath) => {
    console.log("export:" + filePath);
    let data = "test"
    fs.writeFile(filePath, data, function (error) {
        if (error) {
            console.log(error);
        }
    });
});
