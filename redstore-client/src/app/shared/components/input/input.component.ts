import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'rs-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true }],
  template: `
    <label class="rs-input" [class.rs-input--error]="error">
      <span *ngIf="label" class="rs-input__label">{{ label }}</span>
      <span class="rs-input__wrap">
        <span *ngIf="leadingIcon" class="rs-input__icon rs-input__icon--lead">
          <ng-content select="[slot=leading]"></ng-content>
        </span>
        <input
          class="rs-input__field"
          [type]="type"
          [placeholder]="placeholder"
          [attr.name]="name"
          [attr.autocomplete]="autocomplete"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onTouched()" />
        <span *ngIf="trailingIcon" class="rs-input__icon rs-input__icon--trail">
          <ng-content select="[slot=trailing]"></ng-content>
        </span>
      </span>
      <span *ngIf="hint && !error" class="rs-input__hint">{{ hint }}</span>
      <span *ngIf="error" class="rs-input__error">{{ error }}</span>
    </label>
  `,
  styles: [`
    :host { display: block; }
    .rs-input { display: flex; flex-direction: column; gap: 6px; }
    .rs-input__label { font-size: 13px; font-weight: 600; color: var(--rs-text); }
    .rs-input__wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--rs-surface);
      border: 1px solid var(--rs-border);
      border-radius: var(--rs-radius-md);
      transition: border-color var(--rs-dur-fast) var(--rs-ease), box-shadow var(--rs-dur-fast) var(--rs-ease);
    }
    .rs-input__wrap:hover { border-color: var(--rs-border-strong); }
    .rs-input__wrap:focus-within {
      border-color: var(--rs-brand-500);
      box-shadow: var(--rs-shadow-ring);
    }
    .rs-input__field {
      flex: 1; min-width: 0;
      padding: 12px 14px;
      background: transparent;
      border: 0;
      outline: 0;
      font-size: 14px;
      color: var(--rs-text);
    }
    .rs-input__field::placeholder { color: var(--rs-text-subtle); }
    .rs-input__icon { display: inline-flex; padding: 0 12px; color: var(--rs-text-subtle); }
    .rs-input__icon--lead + .rs-input__field { padding-left: 0; }
    .rs-input__icon--trail { cursor: pointer; }
    .rs-input__hint { font-size: 12px; color: var(--rs-text-subtle); }
    .rs-input__error { font-size: 12px; color: var(--rs-danger); font-weight: 500; }
    .rs-input--error .rs-input__wrap {
      border-color: var(--rs-danger);
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
    }
  `],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type: string = 'text';
  @Input() name?: string;
  @Input() autocomplete?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() leadingIcon = false;
  @Input() trailingIcon = false;
  @Input() disabled = false;

  value: string = '';
  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: string): void { this.value = v ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.value = v;
    this.onChange(v);
  }
}
