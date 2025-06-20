export interface ProjectState {
    projects: any[];
    loading: boolean;
    error: string | null;
}

export const initialState: ProjectState = {
    projects: [],
    loading: false,
    error: null,
};