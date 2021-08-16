// @ts-nocheck
/*
 * #Author       : sterben(Duan)
 * #LastAuthor   : sterben(Duan)
 * #Date         : 2020-02-15 15:44:35
 * #lastTime     : 2020-02-15 17:26:23
 * #FilePath     : \src\extension.js
 * #Description  : 
 */
'use strict';

const vscode = require("vscode");

const HDLfilesys = require("HDLfilesys"); //HDL工程文件管理 核心功能是检测HDL项目下的HDL文件 并初始化opeParam对象
const HDLtool = require("HDLtool"); //提供工程所需的服务
const HDLparser = require("HDLparser"); //HDL文件语法解析
const HDLlinter = require("HDLlinter"); //HDL文件的语法检测



function activate(context) {
    //HDL File List Array
    let HDLFileList = [];
    //Project engineering parameters
    let opeParam = {
        "os": "",
        "rootPath": "",
        "workspacePath": "",
        "prjInfo": null,
        "srcTopModule": null,
        "simTopModule": null,
        "currentHDLPath": [],
        "tbFilePath": "",
        "prjInitParam": "",
        "propertyPath": ""
    }
    //HDL Project Tree Array
    let HDLparam = [];
    if (HDLfilesys.prjs.getOpeParam(`${__dirname}`, opeParam) !== null) {
        HDLfilesys.prjs.getPrjFiles(opeParam, HDLFileList);
        // Output Channel
        let outputChannel = vscode.window.createOutputChannel("HDL");

        HDLtool.registerXilinxServer(opeParam);
        HDLtool.registerDebugServer(opeParam);
        HDLtool.registerTreeServer(opeParam);
        HDLtool.registerToolServer(opeParam);
        HDLtool.registerSocServer(opeParam);

        // project Server
        HDLfilesys.registerPrjsServer(context, opeParam);
        let limitNum = vscode.workspace.getConfiguration("PRJ.file.limit").get("number");
        if (HDLFileList.length > limitNum) {
            vscode.window.showWarningMessage(`The project has exceeded the limit of ${HDLFileList.length} HDL files, \
            so parsing and parse-related functions will be stopped directly.`);
        }
        if (HDLFileList.length >= 250) {
            vscode.window.showInformationMessage(`The project contains ${HDLFileList.length} HDL files, \
            which will result in a long parsing time.\n \
            It is recommended that you specify the folder to parse in the property.json file.`);
        }

        try {
            console.time('timer');
            const indexer = new HDLparser.indexer(HDLparam);
            indexer.build_index(HDLFileList).then(() => {
                console.timeEnd('timer');
                console.log(indexer.HDLparam);
                console.log(indexer.symbols);

                let fileExplorer = new HDLtool.tree.FileExplorer(indexer.HDLparam, opeParam, context);
                HDLfilesys.monitor.monitor(opeParam.workspacePath, opeParam, indexer, outputChannel, () => {
                    fileExplorer.treeDataProvider.HDLparam = indexer.HDLparam;
                    fileExplorer.treeDataProvider.refresh();
                });
                // linter Server
                HDLlinter.registerLinterServer();
                // tool Server
                HDLtool.registerSimServer(indexer, opeParam);
                HDLtool.registerLspServer(context, indexer);
                HDLtool.registerBuildServer(context, indexer, opeParam);
                vscode.window.showInformationMessage("Init Finished.");
            });
        } catch (error) {
            console.log(error);
        }
    }
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;