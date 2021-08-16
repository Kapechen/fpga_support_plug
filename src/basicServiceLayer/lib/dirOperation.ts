import * as fs from "fs";
import * as fspath from "path";
import Operation from "./operation";

export default class dirOperation extends Operation{
    create(destPath: string): boolean {
        throw new Error("Method not implemented.");
    }
    delete(destPath: string): boolean {
        throw new Error("Method not implemented.");
    }
    copy(srcPath: string, destPath: string, filter?: any[]): boolean {
        throw new Error("Method not implemented.");
    }
    move(oldPath: string, newPath: string): boolean {
        throw new Error("Method not implemented.");
    }
    read(destPath: string): boolean {
        throw new Error("Method not implemented.");
    }
    constructor(){
        super();
    }
   
}