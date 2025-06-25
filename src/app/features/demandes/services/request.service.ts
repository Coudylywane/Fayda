import { Injectable } from "@angular/core"
import { Store } from '@ngrx/store';
import * as RequestActions from '../store/request.actions';
import * as AdminRequestActions from '../../../Admin/pages/demandes/store/demande.actions';

@Injectable({
    providedIn: "root",
})
export class RequestService {

    constructor(private store: Store,) {
    }

    // Les méthodes suivantes déclenchent les actions NgRx
    getRequest(userId: string) {
        this.store.dispatch(RequestActions.loadRequests({ userId }));
        console.log("loading loadRequests service", userId!);
    }

    // Récupérer les demandes d'un gestionnaire de Dahira
    getRequestByTargetUser(dahiraId: string) {
        this.store.dispatch(RequestActions.loadAdhesionRequests({ dahiraId }));
        console.log("loading loadAdhesionRequests service", dahiraId!);
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
