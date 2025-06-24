import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DahiraServiceAdmin } from 'src/app/Admin/pages/dahira/services/dahira.service';
import { User, UserRole } from '../auth/models/user.model';
import { Dahira } from '../dahiras/models/dahira.model';

@Component({
  selector: 'app-my-dahira',
  templateUrl: './my-dahira.page.html',
  styleUrls: ['./my-dahira.page.scss'],
  standalone: false
})
export class MyDahiraPage implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dahiraService: DahiraServiceAdmin,
  ) { }

  ngOnInit(): void {
    this.dahiraId = this.route.snapshot.paramMap.get('id') || '';

    if (this.dahiraId) {
      this.loadDahiraDetails();
    } else {
      // this.goBack();
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
    this.router.navigate(['home']);
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