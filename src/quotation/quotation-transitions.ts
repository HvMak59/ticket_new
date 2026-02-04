export const QUOTATION_TRANSITIONS = {
    SERVICE_MANAGER: {
        SEND: ['DRAFT', 'REVISED'],
        REVISE: ['CHANGE_REQUESTED'],
    },
    CUSTOMER: {
        ACCEPT: ['SENT', 'REVISED'],
        REJECT: ['SENT', 'REVISED'],
        REQUEST_CHANGE: ['SENT', 'REVISED'],
    },
} as const;
