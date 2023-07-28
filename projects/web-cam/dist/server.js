"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const selfsigned_1 = __importDefault(require("selfsigned"));
const path_1 = __importDefault(require("path"));
const pems = selfsigned_1.default.generate();
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, '../', 'public')));
https_1.default.createServer({
    key: pems.private,
    cert: pems.cert,
}, app).listen(3000, () => {
    console.log('Listening on https://localhost:3000');
});
