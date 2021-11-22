/**
 * Represents a Tenrx login security question.
 *
 * @export
 * @interface TenrxLoginSecurityQuestion
 */
export interface TenrxLoginSecurityQuestion {
    id: number;
    question: string;
    value: string;
    isActive: boolean;
    isDeleted: boolean;
}