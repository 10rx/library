import { TenrxStorage, TenrxStorageScope } from "../../src/index.js";
import fs from 'fs';
import util from 'util';

export default class TenrxFileStorage extends TenrxStorage {

    constructor() {
        super();
    }

    public async save<T>(scope: TenrxStorageScope, key: string, data: T): Promise<void> {
        fs.writeFileSync(`./${scope}.${key}`,JSON.stringify(data))
    }
    public async load<T>(scope: TenrxStorageScope, key: string): Promise<T> {
        return JSON.parse(fs.readFileSync(`./${scope}.${key}`).toString()) as T;
    }

}