import { Logger } from "tslog";

export const TenrxLogger = new Logger({
    name: "TenrxLibrary",
    minLevel: "info",
    type: "pretty",
    maskValuesOfKeys: ["access_token", "authorization", "password", "Authorization"],
    maskPlaceholder: "********"
});