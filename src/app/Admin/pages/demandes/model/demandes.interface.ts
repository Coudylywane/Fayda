export interface Demande {
  id: number;
  demandeur: string;
  role: string;
  type: string;
  sujet: string;
  date: string;
  statut: StatutDemande;
  motifRejet?: string;
}

export type StatutDemande = 'En attente' | 'Approuvée' | 'Rejetée';
