import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DahiraService } from 'src/app/features/dahiras/services/dahira.service';
import { Dahira } from 'src/app/features/dahiras/models/dahira.model';
import { User, UserRole } from 'src/app/features/auth/models/user.model';
import { DahiraServiceAdmin } from '../../services/dahira.service';

@Component({
  selector: 'app-dahira-details',
  templateUrl: './dahira-details.component.html',
  styleUrls: ['./dahira-details.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class DahiraDetailsComponent implements OnInit {
  dahiraId: string = '';
  dahira: Dahira | null = null;
  members: User[] = [];
  filteredMembers: User[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  selectedFilter: string = 'all';
  error: string | null = null;

  showAddMemberModal: boolean = false;
  showRemoveMemberModal: boolean = false;
  showMemberActions: boolean = false;
  usersWithoutDahira: User[] = [];
  selectedUser: User | null = null;
  selectedMember: User | null = null;
  selectedRole: UserRole = UserRole.DISCIPLE;

  roleOptions = [
    { value: UserRole.DISCIPLE, label: 'Disciple' },
    { value: UserRole.MOUKHADAM, label: 'Moukhadam' },
    { value: UserRole.VISITEUR, label: 'Visiteur' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dahiraService: DahiraServiceAdmin,
    // private userService: UserService,
    // private dahiraService: DahiraService,
  ) { }

  ngOnInit(): void {
    this.dahiraId = this.route.snapshot.paramMap.get('id') || '';

    if (this.dahiraId) {
      this.loadDahiraDetails();
    } else {
      this.router.navigate(['admin/dahiras']);
    }
  }

  loadDahiraDetails(): void {
    this.loading = true;
    this.dahiraService.getDahiraById(this.dahiraId).then((response) => {
      if (response.success) {
        this.dahira = response.data.data
        this.members = this.dahira?.members ?? [];
        console.log("Dahira : ", this.dahira);
        this.applyFilters();
        this.loading = false;
      }
    }).catch(error => {
      this.loading = false;
      this.error = error.message;
      console.error('Erreur lors du chargement des détails du dahira', error);
    });
  }

  applyFilters(): void {
    // Appliquer la recherche
    let result = [...this.members];

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      result = result.filter(member =>
        member.firstName.toLowerCase().includes(searchLower) ||
        member.lastName.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower)
      );
    }

    // Appliquer le filtre par rôle
    // if (this.selectedFilter !== 'all') {
    //   result = result.filter(member => member.roles === this.selectedFilter);
    // }

    this.filteredMembers = result;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  openAddMemberModal(): void {
    // this.loadUsersWithoutDahira();
    this.showAddMemberModal = true;
  }

  refresh(){
    this.loadDahiraDetails();
  }

  // loadUsersWithoutDahira(): void {
  //   this.userService.getUsersWithoutDahira().subscribe({
  //     next: (users) => {
  //       this.usersWithoutDahira = users;
  //     },
  //     error: (error) => {
  //       console.error('Erreur lors du chargement des utilisateurs sans dahira', error);
  //     }
  //   });
  // }

  selectUser(user: User): void {
    this.selectedUser = user;
  }

  addMember(): void {
    if (this.selectedUser && this.selectedRole) {
      // this.dahiraService.addMemberToDahira(this.dahiraId, this.selectedUser.userId, this.selectedRole).subscribe({
      //   next: (success: any) => {
      //     if (success) {
      //       this.showAddMemberModal = false;
      //       this.selectedUser = null;
      //       this.loadDahiraMembers();
      //     }
      //   },
      //   error: (error: any) => {
      //     console.error('Erreur lors de l\'ajout du membre', error);
      //   }
      // });
    }
  }

  toggleMemberActions(member: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedMember && this.selectedMember.userId === member.userId) {
      this.showMemberActions = !this.showMemberActions;
    } else {
      this.selectedMember = member;
      this.showMemberActions = true;
    }
  }

  closeMemberActions(): void {
    this.showMemberActions = false;
  }

  viewMemberDetails(member: User, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    // Naviguer vers les détails du membre
    this.router.navigate(['/users', member.userId]);
    this.closeMemberActions();
  }

  openRemoveMemberModal(member: User, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedMember = member;
    this.showRemoveMemberModal = true;
    this.closeMemberActions();
  }

  removeMember(): void {
    if (this.selectedMember) {
      // this.dahiraService.removeMemberFromDahira(this.dahiraId, this.selectedMember.userId).subscribe({
      //   next: (success) => {
      //     if (success) {
      //       this.showRemoveMemberModal = false;
      //       this.selectedMember = null;
      //       this.loadDahiraMembers();
      //     }
      //   },
      //   error: (error) => {
      //     console.error('Erreur lors du retrait du membre', error);
      //   }
      // });
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.member-actions-btn') && !target.closest('.member-actions-menu') && this.showMemberActions) {
      this.showMemberActions = false;
    }
  }

  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
    this.selectedUser = null;
  }

  closeRemoveMemberModal(): void {
    this.showRemoveMemberModal = false;
    this.selectedMember = null;
  }

  goBack(): void {
    this.router.navigate(['admin/dahira']);
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.COLLECTE_FONDS:
        return 'bg-purple-100 text-purple-800';
      case UserRole.MOUKHADAM:
        return 'bg-blue-100 text-blue-800';
      case UserRole.DISCIPLE:
      default:
        return 'bg-green-100 text-green-800';
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case UserRole.COLLECTE_FONDS:
        return 'Collecteur de fonds';
      case UserRole.MOUKHADAM:
        return 'Moukhadam';
      case UserRole.DISCIPLE:
      default:
        return 'Disciple';
    }
  }

  getResponsable(): string {
    this.members.filter(e => {
      
    })
    return ""
  }

    /**
   * Vérifie si c'est une recherche vide
   */
  isEmptySearch(): boolean {
    return this.searchTerm.length > 0 && !this.loading;
  }

    /**
   * Vérifie s'il n'y a aucune donnée
   */
  hasNoData(): boolean {
    return this.members.length === 0 && !this.loading;
  }
}