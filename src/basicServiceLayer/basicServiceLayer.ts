
import * as vscode from 'vscode';
import { fileProcess } from './lib/fileProcess';

export class basicServiceLayer{
    fP:fileProcess;
    constructor(){
        this.fP = new fileProcess();
    }
}

//let test:basicServiceLayer;
let test = new basicServiceLayer();
