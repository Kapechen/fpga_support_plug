"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operation_1 = require("./operation");
class dirOperation extends operation_1.default {
    create(destPath) {
        throw new Error("Method not implemented.");
    }
    delete(destPath) {
        throw new Error("Method not implemented.");
    }
    copy(srcPath, destPath, filter) {
        throw new Error("Method not implemented.");
    }
    move(oldPath, newPath) {
        throw new Error("Method not implemented.");
    }
    read(destPath) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super();
    }
}
exports.default = dirOperation;
//# sourceMappingURL=dirOperation.js.map