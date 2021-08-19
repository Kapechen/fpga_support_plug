import * as fs from "fs";
import * as path from "path";


export class fileProcess {
    private _tempFiles: string[];
    constructor() {
        this._tempFiles = [];
        // super();
    }
    /**
     * @descriptionEN: Synchronization Determines whether the file or folder at the given path exists on the file system
     * @descriptionCN: 同步判断给定路径的文件或文件夹在文件系统上是否存在
     * @LastEditTime: 
     * @param {string} givenPath
     * @return {*} boolean
     */
    judgePathExistsSync(givenPath: string): boolean {
        return fs.existsSync(givenPath);
    }
    /**
     * @descriptionEN: Determines whether the given path is a folder
     * @descriptionCN: 判断给定路径是否是个文件夹
     * @LastEditTime: 2021/08/19
     * @param {string} destPath
     * @return {*} boolean
     */
    isDirectory(destPath: string): boolean {
        if (fs.lstatSync(destPath).isDirectory()) {
            return true;
        }
        return false;
    }
    /**
     * @descriptionEN: Creates a file or folder based on the given path
     * @descriptionCN: 根据给定路径创建文件或文件夹
     * @LastEditTime: 2021/08/19
     * @param {string} destPath
     * @param {string | NodeJS.ArrayBufferView | undefined} data
     * @return {*} boolean
     */
    create(destPath: string, data?: string | NodeJS.ArrayBufferView): boolean {
        if (this.judgePathExistsSync(destPath)) {
            return true;
        } else {
            //Check whether the parent directory exists
            //判断其父目录是否存在
            let parentPath = path.dirname(destPath);
            if (!parentPath) {
                this.create(destPath);
                return true;
            }
            if (!data) {
                try {
                    fs.mkdirSync(destPath);
                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            } else {
                try {
                    fs.writeFileSync(destPath, data);
                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            }
        }
    }
    /**
     * @descriptionEN: Synchronously reads and returns the names of all files in the folder at the given path
     * @descriptionCN: 同步读取并返回给定路径文件夹下的所有文件/文件夹名称
     * @LastEditTime: 2021/08/19
     * @param {string} destPath
     * @return {*} string[]
     */
    readDir(destPath: string): string[] {
        if (!this.judgePathExistsSync(destPath)) {
            console.error("The destPath Doesn't Exit!");
            return [];
        } else if (!this.isDirectory(destPath)) {
            //console.error("The destPath is Not A Directory!");
            return [];
        } else {
            try {
                return fs.readdirSync(destPath);
            } catch (error) {
                console.error(error);
                return [];
            }
        }
    }
    /**
    * @descriptionEN: Asynchronously reads and returns the names of all files in the folder at the given path
    * @descriptionCN: 异步读取并返回给定路径文件夹下的所有文件/文件夹名称
    * @LastEditTime: 2021/08/19
    * @param {string} destPath
    * @return {*} string[]
    */
    readDirAsync(destPath: string): string[] {
        this._tempFiles = [];
        if (!this.judgePathExistsSync(destPath)) {
            console.error("The destPath Doesn't Exit!");
            return [];
        } else if (!this.isDirectory(destPath)) {
            return [];
        } else {
            fs.readdir(destPath, 'utf-8', (err, files: string[]) => {
                if (err) {
                    console.error(err);
                    return [];
                }
                this._tempFiles = files;
            })
        }
        return this._tempFiles;
    }
    /**
     * @descriptionEN: Delete all files/folders in the specified folder
     * @descriptionCN: 删除指定文件夹下的所有文件/文件夹
     * @LastEditTime: 
     * @param {string} destDirPath
     * @return {*} boolean
     */
    deleteAll(destDirPath: string): boolean {
        if (!this.judgePathExistsSync(destDirPath)) {
            console.error("destDirPath Not Exit!");
            return false;
        } else if (!this.isDirectory(destDirPath)) {
            console.error("destDirPath Not A Directory!");
            return false;
        }
        let toBeDeletedFiles: string[] = this.readDir(destDirPath);
        toBeDeletedFiles.forEach((element) => {
            let curPath = path.join(destDirPath, element).replace(/\\/g, "\/");
            if (this.isDirectory(curPath)) {
                this.deleteAll(curPath);
            } else {
                try {
                    fs.unlinkSync(curPath);
                } catch (error) {
                    console.log(error);
                    return false;
                }
            }
        });
        try {
            fs.rmdirSync(destDirPath);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * @descriptionEN: Determine whether the paths passed in are equal
     * @descriptionCN: 判断传入的路径是否相等
     * @LastEditTime: 2021/08/19
     * @param {array} Paths
     * @return {*}
     */
    isPathEqual(...Paths: string[]): boolean {
        if (Paths.length === 0 || Paths.length === 1) {
            return false;
        }
        Paths = Paths.sort();
        for (let i = 0; i < Paths.length; i++) {
            if (Paths.indexOf(Paths[i]) !== -1) {
                return true;
            }
        }
        return false;
    }
    //
    /**
     * @descriptionEN: Copy files/folders from source path(Dir Path) to destination path(Dir Path)
     * @descriptionCN: 将源路径(文件夹路径)下的文件/文件夹复制到目标路径(文件夹路径)
     * @LastEditTime: 2021/08/19
     * @param {string} srcPath
     * @param {string} destPath
     * @param {string} filter
     * @return {*} boolean
     */
    copyFilesByDirPath(srcPath: string, destPath: string, filter: string[] = []): boolean {
        if (this.isPathEqual(srcPath, destPath)) {
            return false;
        }
        if (!this.judgePathExistsSync(srcPath)) {
            console.error("The srcPath Doesn't Exit!");
            return false;
        } else if (!this.isDirectory(srcPath) || !this.isDirectory(destPath)) {
            console.error("Path Is Not A Directory!");
            return false;
        } else {
            let srcfiles: string[] = this.readDirAsync(srcPath);
            if (srcfiles.length === 0) {
                //There is no file in the source folder or an error reading the file
                //源文件夹下没有文件或读取文件时出错
                return false;
            }
            srcfiles.forEach((srcfileName: string) => {
                let srcfilePath = path.join(srcPath, srcfileName);
                let filterFlag = filter.some((item) => {
                    return item === srcfileName;
                })
                if (!filterFlag) {
                    //For files that are not filtered
                    //针对没有被设置过滤的文件
                    if (!this.isDirectory(srcfilePath)) {
                        let destFilePath = path.join(destPath, srcfileName);
                        fs.copyFile(srcfilePath, destFilePath, (err) => {
                            if (err) {
                                console.error(err);
                                return false;
                            }
                        })
                    } else {
                        let destFileDir = path.join(destPath, srcfileName);
                        if (this.create(destFileDir)) {
                            this.copyFilesByDirPath(srcfilePath, destFileDir, filter);
                        } else {
                            return false;
                        }
                    }
                }
            })
            return true;
        }
    }
    /**
     * @descriptionEN: Cut files/folders from the source path(Dir Path) to the destination path(Dir Path)
     * @descriptionCN: 将源路径(文件夹路径)下的文件/文件夹剪切到目标路径(文件夹路径)
     * @LastEditTime: 2021/08/19
     * @param {string} srcPath
     * @param {string} destPath
     * @param {string} fillter
     * @return {*} boolean
     */
    moveFilesByDirPath(srcPath: string, destPath: string, fillter: string[] = []): boolean {
        if (this.copyFilesByDirPath(srcPath, destPath, fillter)) {
            if (this.deleteAll(srcPath)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}