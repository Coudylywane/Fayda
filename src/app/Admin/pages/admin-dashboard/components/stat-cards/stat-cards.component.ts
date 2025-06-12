import { Component, OnInit } from '@angular/core';
import { StatCard } from '../../models/dashboard.model'
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { selectTotalDahiras } from 'src/app/features/dahiras/store/dahira.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-stat-cards',
  templateUrl: './stat-cards.component.html',
  styleUrls: ['./stat-cards.component.scss'],
  imports: [CommonModule]
})
export class StatCardsComponent implements OnInit {
  totalDahiras: number = 0;
  private destroy$ = new Subject<void>();
  statCards: StatCard[] = [];

  constructor(private store: Store,) { }

  ngOnInit() {
    this.store.select(selectTotalDahiras).pipe(
      takeUntil(this.destroy$)
    ).subscribe(total => {

      this.totalDahiras = total;
      this.updateStatCards();
      // console.log("total Dahira: ", total);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  updateStatCards() {
    this.statCards = [
      {
        title: 'Disciples',
        value: '438',
        change: '+8%',
        colorClass: 'text-blue-500',
        iconColorClass: 'bg-blue-100',
        icon: 'users'
      },
      {
        title: 'Dahiras',
        value: this.totalDahiras,
        change: '+8%',
        colorClass: 'text-green-500',
        iconColorClass: 'bg-green-100',
        icon: 'group'
      },
      {
        title: 'Mouquadam',
        value: '12',
        change: '+8%',
        colorClass: 'text-red-400',
        iconColorClass: 'bg-red-100',
        icon: 'users'
      },
      {
        title: 'Levée des fonds',
        value: '1 500 000 XOF',
        change: '+8%',
        colorClass: 'text-blue-500',
        iconColorClass: 'bg-blue-100',
        icon: 'cash'
      },
      {
        title: 'Tourisme spirituel',
        value: '12',
        change: '',
        colorClass: 'text-gray-800',
        iconColorClass: 'bg-gray-100',
        icon: 'chart'
      }
    ];
  }
}
