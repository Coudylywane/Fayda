import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class SelectorComponent {
    @Input() options: {
    value: any,
    label: string,
    icon?: string,    // Classes CSS pour l'icône (ex: "fas fa-flag")
    flag?: string,    // URL vers une image de drapeau
    badge?: string    // Texte du badge optionnel
  }[] = [];
  @Input() placeholder = 'Sélectionnez une option';
  @Output() selectedChange = new EventEmitter<any>();

  isOpen = false;
  selectedOption: any = null;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  selectOption(option: any) {
    this.selectedOption = option;
    this.selectedChange.emit(option.value);
    this.close();
  }
}