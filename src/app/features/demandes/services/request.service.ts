import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable, of } from "rxjs"
import { Store } from '@ngrx/store';
import * as RequestActions from '../store/request.actions';
import { selectCurrentUser } from "../../auth/store/auth.selectors";

@Injectable({
    providedIn: "root",
})
export class RequestService {
    userId!: string;

    constructor(private store: Store,) {

    }

    // Les méthodes suivantes déclenchent les actions NgRx
    async getRequest(userId: string) {
        this.store.dispatch(RequestActions.loadRequests({ userId }));
        console.log("loading service", userId!);
    }

    // Récupérer les demandes d'un gestionnaire de Dahira
    async getRequestByTargetUser(userId: string) {
        this.store.dispatch(RequestActions.loadAdhesionRequests({ userId }));
        console.log("loading service", userId!);
    }
}
