import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable, of } from "rxjs"
import { Store } from '@ngrx/store';
import * as RequestActions from '../store/request.actions';
import * as AdminRequestActions from '../../../Admin/pages/demandes/store/demande.actions';
import { selectCurrentUser } from "../../auth/store/auth.selectors";

@Injectable({
    providedIn: "root",
})
export class RequestService {
    userId!: string;

    constructor(private store: Store,) {

    }

    // Les méthodes suivantes déclenchent les actions NgRx
    getRequest(userId: string) {
        this.store.dispatch(RequestActions.loadRequests({ userId }));
        console.log("loading service", userId!);
    }

    // Récupérer les demandes d'un gestionnaire de Dahira
    getRequestByTargetUser(userId: string) {
        this.store.dispatch(RequestActions.loadAdhesionRequests({ userId }));
        console.log("loading service", userId!);
    }

    /**
     *
     * Recupérer toutes les demandes
     * @memberof RequestService
     */
    getAllRequest(){
        this.store.dispatch(AdminRequestActions.loadAdminRequests());
        console.log("loading service getAllRequest");
    }
}
