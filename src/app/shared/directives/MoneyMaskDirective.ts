import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appMoneyMask]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: MoneyMaskDirective,
    multi: true
  }]
})
export class MoneyMaskDirective implements ControlValueAccessor {

  private el: HTMLInputElement;
  private onChange: ((value: number) => void) | undefined;
  private onTouched: (() => void) | undefined;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.el = this.elementRef.nativeElement;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: number): void {
    if (value !== undefined && value !== null) {
      const formattedValue = this.formatValue(value);
      this.renderer.setProperty(this.el, 'value', formattedValue);
    } else {
      this.renderer.setProperty(this.el, 'value', '0,00');
    }
  }

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = this.el;
    let value = input.value;

    value = value.replace(/[^0-9]/g, '');

    if (value) {
      let intValue = parseInt(value, 10);
      let numericValue = intValue / 100;

      if (this.onChange) {
        this.onChange(numericValue);
      }

      input.value = this.formatValue(numericValue);
    } else {
      input.value = '0,00';
      if (this.onChange) {
        this.onChange(0);
      }
    }
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const input = this.el;

    if (event.key === 'Backspace') {
      event.preventDefault();

      let value = input.value.replace(/[^0-9]/g, '');

      if (value.length > 0) {
        value = value.substring(0, value.length - 1);

        if (value.length > 0) {
          let intValue = parseInt(value, 10);
          let numericValue = intValue / 100;

          if (this.onChange) {
            this.onChange(numericValue);
          }

          input.value = this.formatValue(numericValue);
        } else {
          input.value = '0,00';
          if (this.onChange) {
            this.onChange(0);
          }
        }
      }
    }
  }

  @HostListener('blur', ['$event']) onBlur(event: Event) {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  private formatValue(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
