export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'en_cours' | 'en_attente' | 'termine';
    progress: number;
    dueDate: Date;
    contributors?: Contributor[];
}

export interface ProjectDTO {
    collectionId: string,
    creatorName:string,
    title: string,
    description: string,
    targetAmount: number,
    currentAmount: number,
    status: string,
    progressPercentage: number,
    isActive: boolean,
    isTargetAchieved: boolean,
    isClosed: boolean,
    startDate: string,
    endDate: string,
    remainingDays: number,
    totalDurationInDays: number
    progress: number,
    createdAt: string,
    updatedAt: string,
}

export interface Contributor {
    id: string;
    name: string;
    amount: number;
    date: Date;
}

export interface CreateProjectDTO {
    title: string,
    description: string,
    targetAmount: number | string,
    startDate: string,
    endDate: string,
}