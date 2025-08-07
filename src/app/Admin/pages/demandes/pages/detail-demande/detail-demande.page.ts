import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Demande, StatutDemande } from '../../model/demandes.interface';
import { RequestApiService } from 'src/app/features/demandes/services/request.api';

@Component({
  selector: 'app-detail-demande',
  templateUrl: './detail-demande.page.html',
  styleUrls: ['./detail-demande.page.scss'],
  standalone: false,
})
export class DetailDemandePage implements OnInit {
  demand: Demande | null = null;
  notFound: boolean = false;
  loading: boolean = false;
  updatingStatus: boolean = false;
  errorMessage: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadDemand(id || '');
    // if (id) {
    //   this.loadDemand(parseInt(id, 10));
    // } else {
    //   this.notFound = true;
    // }
  }

  loadDemand(id: string): void {
    this.loading = true;
    RequestApiService.getRequestDetail(id)
      .then((response) => {
        const data = response.data;

        this.demand = {
          id: data.requestId,
          demandeur: data.requesterName,
          role: data.requesterRole || 'Non spécifié',
          type: this.getRequestTypeLabel(data.requestType),
          sujet: data.subject || 'Aucun sujet fourni',
          date: this.formatDate(data.createdAt),
          statut: this.getStatusLabel(data.approvalStatus),
          motifRejet: data.rejectionReason || '',
        };

        this.loading = false;
      })
      .catch((err) => {
        console.error('Erreur chargement demande:', err);
        this.notFound = true;
        this.loading = false;
      });
  }

  getRequestTypeLabel(type: string): string {
    switch (type) {
      case 'JOIN_DAHIRA':
        return 'Adhésion';
      case 'CREATE_DAHIRA':
        return 'Création Dahira';
      case 'LEAVE_DAHIRA':
        return 'Quitter Dahira';
      default:
        return type;
    }
  }

  getStatusLabel(status: string): StatutDemande {
    switch (status) {
      case 'APPROVED':
        return 'Approuvée';
      case 'PENDING':
        return 'En attente';
      case 'REJECTED':
        return 'Rejetée';
      default:
        return 'En attente';
    }
  }

  getStatusColor(status: StatutDemande): string {
    switch (status) {
      case 'Approuvée':
        return 'bg-green-100 text-green-800';
      case 'En attente':
        return 'bg-orange-100 text-orange-800';
      case 'Rejetée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goBack(): void {
    this.router.navigate(['/tabs/demandes']);
  }

  // Action: approuver la demande
  // approveDemand() {
  //   if (!this.demand) return;
  //   this.updateStatus('APPROVED');
  // }

  // // Action: rejeter la demande avec raison optionnelle
  // rejectDemand(reason?: string) {
  //   if (!this.demand) return;
  //   this.updateStatus('REJECTED', reason);
  // }

  // private updateStatus(
  //   newStatus: 'APPROVED' | 'REJECTED',
  //   rejectionReason?: string
  // ) {
  //   if (!this.demand) return;

  //   this.updatingStatus = true;
  //   this.errorMessage = null;

  //   const payload = {
  //     requestId: this.demand.id,
  //     approvalStatus: newStatus,
  //     rejectionReason: rejectionReason || null,
  //   };

  //   // Appelle ton API d'approbation via RequestApiService
  //   RequestApiService.approval(payload)
  //     .then((response) => {
  //       // Mise à jour locale du statut
  //       this.demand!.statut = this.getStatusLabel(newStatus);
  //       if (newStatus === 'REJECTED') {
  //         this.demand!.motifRejet = rejectionReason || 'Motif non précisé';
  //       } else {
  //         this.demand!.motifRejet = undefined;
  //       }
  //       this.updatingStatus = false;
  //     })
  //     .catch((err) => {
  //       this.errorMessage =
  //         err.message || 'Erreur lors de la mise à jour du statut';
  //       this.updatingStatus = false;
  //     });
  // }
}
