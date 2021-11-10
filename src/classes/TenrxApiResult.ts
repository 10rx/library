export class TenrxApiResult {
    public status: number;
    public content: any;
    public error: any;
    constructor(status: number = 0, content: any = null, error: any = null) {
        this.status = status;
        this.content = content;
        this.error = error;
    }
}