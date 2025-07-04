

// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CreateProjectDTO, Project } from '../models/projet.model';
import { Store } from '@ngrx/store';
import * as ProjectActions from '../store/project.actions';
import { ProjectApiService } from './project.api';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    constructor(private store: Store,) {

    }


    /**
     * Dispatcher l'action de getAllProject
     *
     * @memberof ProjectService
     */
    getProjects() {
        this.store.dispatch(ProjectActions.loadProjects());
    }

    /**
     * 
     * @returns les projets de collectes de fonds de l'utilisateur courant
     */
    getOwnProjects() {
        return ProjectApiService.getProjectByUser();
    }

    getProjectById(id: string) {
        return ProjectApiService.getProjectById(id);
    }

    addProject(project: CreateProjectDTO) {
        return ProjectApiService.createProject(project);
    }


    updateProject(project: Project): void {
    }

    changeStatus(id: string, status: 'en_cours' | 'en_attente' | 'termine'): void {

    }

    archiveProject(id: string): void {

    }
}