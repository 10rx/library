export default abstract class TenrxChatParticipant {
    public id: string;
    public nickName: string;

    constructor(nickName: string) {
        this.id = '';
        this.nickName = nickName;
    }
}