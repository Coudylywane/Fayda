export interface Request {
  requestId: string;
  requesterId: string;
  requesterName: string;
  targetDahiraId: string;
  targetDahiraName: string;
  requestType: string;
  approvalStatus: Status;
  createdAt: string;
  updatedAt: string;
}

export enum RequestType {
    BECOME_DISCIPLE = "BECOME_DISCIPLE",
    JOIN_DAHIRA = "JOIN_DAHIRA",
    BECOME_MOUQADAM = "BECOME_MOUQADAM",
    BECOME_FONDS_CREATOR = "BECOME_FONDS_CREATOR",
    CREATE_DAHIRA = "CREATE_DAHIRA",
}

export enum Status {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}