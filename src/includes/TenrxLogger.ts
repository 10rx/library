import { Logger } from "tslog";

export const TenrxLogger = new Logger({
    name: "TenrxLibrary",
    minLevel: "warn",
    type: "hidden",
    maskValuesOfKeys: ["access_token", "authorization", "password"],
    maskPlaceholder: "********"
});