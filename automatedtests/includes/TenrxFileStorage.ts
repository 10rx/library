import { TenrxStorage, TenrxStorageScope } from "../../src/index.js";
import fs from 'fs';
import util from 'util';

export default class TenrxFileStorage extends TenrxStorage {

    constructor() {
        super();
    }

    public async save<T>(scope: TenrxStorageScope, key: string, data: T): Promise<void> {
        await fs.promises.writeFile(`./${scope}.${key}`,JSON.stringify(data))
    }
    public async load<T>(scope: TenrxStorageScope, key: string): Promise<T> {
        return JSON.parse((await fs.promises.readFile(`./${scope}.${key}`)).toString()) as T;
    }

    public saveSync<T>(scope: TenrxStorageScope, key: string, data: T): void {
        fs.writeFileSync(`./${scope}.${key}`,JSON.stringify(data))
    }
    public loadSync<T>(scope: TenrxStorageScope, key: string): T {
        return JSON.parse(fs.readFileSync(`./${scope}.${key}`).toString()) as T;
    }
}