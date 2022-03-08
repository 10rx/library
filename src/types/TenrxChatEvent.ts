import { TenrxChatEventType } from "../includes/TenrxEnums.js";

export default interface TenrxChatEvent {
    senderId: string | null;
    recipientId: string | null;
    type: TenrxChatEventType; // Need to switch to enum
    payload: TenrxChatEventPayload | null;
}

export interface TenrxChatParticipantJoinedPayload {
    nickName: string;
    id: string;
    avatar: string;
}

export interface TenrxChatMessagePayload {
    message: string;
    metadata: {
        kind: string;
        data: unknown;
    } | null;
}

export type TenrxChatEventPayload = TenrxChatParticipantJoinedPayload | TenrxChatMessagePayload;