import { Logger } from "tslog";

// Using a different naming convention for the logger. This a global variable.
// eslint-disable-next-line @typescript-eslint/naming-convention
export const TenrxLogger = new Logger({
    name: "TenrxLibrary",
    minLevel: "info",
    type: "pretty",
    maskValuesOfKeys: ["access_token", "authorization", "password", "Authorization"],
    maskPlaceholder: "********"
});