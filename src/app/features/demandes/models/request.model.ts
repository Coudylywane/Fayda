export interface RequestDto {
  requestId: string;
  requesterId: string;
  requesterName: string;
  targetDahiraId: string;
  targetDahiraName: string;
  requestType: RequestTypeEnum;
  rejectionReason?: string;
  approvalStatus: StatusEnum;
  createdAt: string;
  updatedAt: string;
}


export enum RequestTypeEnum {
    BECOME_DISCIPLE = "BECOME_DISCIPLE",
    JOIN_DAHIRA = "JOIN_DAHIRA",
    BECOME_MOUQADAM = "BECOME_MOUQADAM",
    BECOME_FONDS_CREATOR = "BECOME_FONDS_CREATOR",
    CREATE_DAHIRA = "CREATE_DAHIRA",
    CREATE_FUND_COLLECTION = "CREATE_FUND_COLLECTION",
}

export enum StatusEnum {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export interface ApprovalDto {
  targetId: string,
  approved: boolean,
  rejectionReason?: string,
  targetType: RequestTypeEnum
}