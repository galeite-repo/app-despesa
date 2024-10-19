import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appInputMask]',
  standalone: true,
})
export class InputMaskDirective {

  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    let input = this.el.nativeElement.value;

    // Remove tudo que não for dígito
    input = input.replace(/\D/g, '');

    // Formata para dd-mm-yyyy
    if (input.length > 2) {
      input = input.slice(0, 2) + '-' + input.slice(2);
    }
    if (input.length > 5) {
      input = input.slice(0, 5) + '-' + input.slice(5, 9);
    }

    // Atualiza o valor do input
    this.el.nativeElement.value = input;

    // Verifica se a data está completa
    if (input.length === 10) {
      const day = input.slice(0, 2);
      const month = input.slice(3, 5);
      const year = input.slice(6, 10);

      // Formata para yyyy-mm-dd
      const formattedValue = `${year}-${month}-${day}`;

      // Atualiza o valor do form control no formato yyyy-mm-dd
    //   this.control.control?.setValue(formattedValue, { emitEvent: false });
    }
  }
}
