// phone-input.component.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { COUNTRIES } from '../../utils/countries';

/**
 * Composant d'entrée de numéro de téléphone avec sélection de pays.
 * Permet de saisir un numéro de téléphone international avec un indicatif de pays.
 */
@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ],
  imports: [CommonModule, FormsModule]
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Numéro de téléphone';
  @Output() countryChange = new EventEmitter<any>();
  
  
  countries = COUNTRIES;
  selectedCountry = this.countries[0]; // France par défaut
  phoneNumber = '';
  isCountrySelectOpen = false;
  
  // NG_VALUE_ACCESSOR methods
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private elementRef: ElementRef) {
  }


  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isCountrySelectOpen = false;
    }
  }

  writeValue(value: any): void {
    if (value) {
      this.parsePhoneValue(value);
    }
  }

  close() {
    this.isCountrySelectOpen = false;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  parsePhoneValue(value: string) {
    // Logique pour parser le numéro international existant
    const country = this.countries.find(c => value.startsWith(c.dialCode));
    if (country) {
      this.selectedCountry = country;
      this.phoneNumber = value.replace(country.dialCode, '');
    }
  }

  get fullPhoneNumber(): string {
    return this.selectedCountry.dialCode + this.phoneNumber;
  }

  toggleCountrySelect() {
    this.isCountrySelectOpen = !this.isCountrySelectOpen;
  }

selectCountry(country: any, event?: MouseEvent) {
  if (event) {
    event.stopPropagation();
  }
  this.selectedCountry = country;
  this.isCountrySelectOpen = false;
  this.countryChange.emit(country);
  this.onChange(this.fullPhoneNumber);
}

  onPhoneNumberChange() {
    this.onChange(this.fullPhoneNumber);
  }
}