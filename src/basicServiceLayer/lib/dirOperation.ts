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
     * @description Synchronously reads and returns a string array with the names of all files in the target directory
     * @author Kapechen
     * @date 17/08/2021
     * @param {string} destPath
     * @returns {*}  {(string[])}
     * @memberof dirOperation
     */
    read(destPath: string): string[] {
        if (this.judgeExistsSync(destPath) !== Result.PAE) {
            console.log(`Error Happens While Reading Directories:${Result.PNE}`);
            return [];
        }
        try {
            return fs.readdirSync(destPath);
        } catch (error) {
            console.log(error);
            return [];
        }
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
            let tempFiles: string[] = this.read(destPath);
            if (tempFiles.length == 0) {
                return false;
            }
            //let tempFiles: string[] = typeof this.read(destPath) === boolean? null:;
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
    /**
     * @description Copy files asynchronously from the source path to the destination path
     * @author Kapechen
     * @date 17/08/2021
     * @param {string} srcPath
     * @param {string} destPath
     * @param {any[]} filter
     * @returns {*}  {boolean}
     * @memberof dirOperation
     */
    copy(srcPath: string, destPath: string, filter: any[]): boolean {
        if (this.judgeExistsSync(srcPath) !== Result.PAE) {
            console.error(`Error Happens While Copying Directories：${Result.PNE}`);
            return false;
        }
        fs.readdir(srcPath, (err, files: string[]) => {
            if (err) {
                console.log(err);
                return false;
            }
            files.forEach((fileName) => {
                let fileDir: string = fspath.join(srcPath, fileName);
                let filterFlag: boolean = filter.some((item) => {
                    return item === fileName;
                });
                //Filter out files or folders that do not need to be copied
                if (!filterFlag) {
                    fs.stat(fileDir, (err, stats) => {
                        if (err) {
                            console.log(err);
                            return false;
                        }
                        let isFile: boolean = stats.isFile();
                        if (isFile) {
                            let finalDestPath = fspath.join(destPath, fileName);
                            fs.copyFile(fileDir, finalDestPath, (err) => {
                                if (err) console.log(err); return false;
                            })
                        } else {
                            let destFileDir = fspath.join(destPath, fileName);
                            fs.mkdir(destFileDir, (err) => {
                                if (err) {
                                    console.log(err);
                                    return false;
                                }
                                this.copy(fileDir, destFileDir, filter);
                            })
                        }
                    })
                }
            });
        })
        return true;
    }
    move(oldPath: string, newPath: string): boolean {
        if (oldPath === newPath) return false;
        if (this.judgeExistsSync(oldPath) !== Result.PAE ||
            this.judgeExistsSync(newPath) !== Result.PAE) {
            console.error(`Error Happens While Moving Directories：${Result.PNE}`);
            return false;
        }
        // else if (this.judgeExistsSync(oldPath) == Result.NAD ||
        //     this.judgeExistsSync(newPath) == Result.NAD) {
        //     console.error(`Error Happens While Moving Directories：${Result.NAD}`);
        //     return false;
        // }
        try {
            let folderName: string = fspath.basename(oldPath);
            newPath = newPath + '/' + folderName;
            if(fs.existsSync(oldPath)){
                if(fs.existsSync(newPath)){
                    this.delete(newPath);
                }
                fs.renameSync(oldPath,newPath);
            }else{
                this.create(newPath);
            }
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }

    }

    /**
     * @description Synchronously tests whether or not the given directory path or its  parent directory path exists
     * @author Kapechen
     * @date 17/08/2021
     * @param {string} path
     * @returns {*} string Result.xxx
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