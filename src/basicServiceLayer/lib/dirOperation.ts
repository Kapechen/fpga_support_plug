import * as fs from "fs";
import * as fspath from "path";
import Operation from "./operation";
enum Result {
    PAE = "Path Already Exist",
    PNE = "Path Not Exist",
    NAD = "Not A Directory",
    PDNE = "Parent Directory Not Exist",
    OK = "OK"
}
export default class dirOperation extends Operation {
    constructor() {
        super();
    }
    /**
     * @description Create a folder based on the destination path passed in
     * @author Kapechen
     * @date 17/08/2021
     * @param {string} destPath
     * @returns {*}  {boolean}
     * @memberof dirOperation
     */
    create(destPath: string): boolean {
        let result: string = this.judgeExistsSync(destPath);
        switch (result) {
            case Result.PAE:
                return true;
            case Result.NAD:
                return false;
            case Result.PDNE:
                this.create(fspath.dirname(destPath));
            case Result.OK:
                try {
                    fs.mkdirSync(destPath);
                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
        }
        return false;
    }
    /**
     * @description Delete the target folder and all files/folders under the folder
     * @author Kapechen
     * @date 17/08/2021
     * @param {string} destPath
     * @returns {*}  {boolean}
     * @memberof dirOperation
     */
    delete(destPath: string): boolean {
        if (this.judgeExistsSync(destPath) !== Result.PAE) {
            console.log(Result.PNE);
            return false;
        }
        //Method returns an array of strings containing the names of all files in the specified directory
        try {
            let tempFiles: string[] = fs.readdirSync(destPath);
            tempFiles.forEach((element) => {
                let curPath = fspath.join(destPath, element).replace(/\\/g, "\/");
                if (fs.statSync(curPath).isDirectory()) {
                    this.delete(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(destPath);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }

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
    /**
     * @description Synchronously tests whether or not the given directory path or its  parent directory path exists
     * @author Kapechen
     * @date 17/08/2021
     * @param {string} path
     * @returns {*}  {string}
     * @memberof dirOperation
     */
    judgeExistsSync(path: string): string {
        //Check whether the path already exists
        if (!fs.existsSync(path)) {
            if (fs.statSync(path).isDirectory()) {
                //For a folder, check whether its parent directory exists
                if (fspath.dirname(path)) {
                    return Result.OK;
                } else {
                    return Result.PDNE;
                }
            } else {
                return Result.NAD;
            }
        } else {
            return Result.PAE;
        }
    }


}