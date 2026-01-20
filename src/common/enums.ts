// All application enums consolidated in one file

export enum RoleType {
  ADMIN = 'admin',
  SERVICE_MANAGER = 'service_manager',
  FIELD_ENGINEER = 'field_engineer',
  CUSTOMER = 'customer',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  QUOTATION_SENT = 'QUOTATION_SENT',
  APPROVED = 'APPROVED',
  ASSIGNED = 'ASSIGNED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum QuotationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum FileType {
  IMAGE = 'Image',
  VIDEO = 'Video',
}
