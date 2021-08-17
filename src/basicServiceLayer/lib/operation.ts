/**
 * @description Provide files or folders to add, delete, change and other basic abstract operations
 * @author Kapechen
 * @date 16/08/2021
 * @export
 * @abstract
 * @class Operation
 */
export default abstract class Operation {
    abstract create(destPath: string): boolean;
    abstract delete(destPath: string): boolean;
    abstract copy(srcPath: string, destPath: string, filter?: Array<any>): boolean;
    abstract move(oldPath: string, newPath: string): boolean;
    abstract read(destPath: string): boolean;
    abstract judgeExistsSync(path: string): string;
}