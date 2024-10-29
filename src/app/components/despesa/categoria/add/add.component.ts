import { AfterViewInit, Component, ElementRef, Inject, inject, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Categoria, CategoriasService } from '../../../service/categoria.service';

interface CategoriaForm {
  categoria: FormControl<string | null>;
}

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent implements AfterViewInit {
  @ViewChild('categoriaInput') categoriaInput!: ElementRef;


  constructor(
    private modalService: ModalService,
    @Inject("data") public data: any,
    @Optional() @Inject('onCreate') public onCreate: (categoria: any) => void = () => { },
  ) {}
  private formBuilder = inject(FormBuilder);

  categoria!: Categoria;
  categoriaSelected!: Categoria;

  categoriaService = inject(CategoriasService);

  form = this.formBuilder.group<CategoriaForm>({
    categoria: this.formBuilder.control(null, Validators.required),
  });

  ngAfterViewInit(): void {
    this.categoriaInput.nativeElement.focus();
  }


  async add() {
    this.categoria = this.form.value as Categoria
    if (this.categoriaSelected) {
      this.categoria.id = this.categoriaSelected.id
      await this.categoriaService.update(this.categoria)
    } else {
      await this.categoriaService.insert(this.categoria)
    }
    this.form.reset();
    this.onCreate(this.categoria)
    this.closeModal();
  }
  edit(categoria: Categoria) {
    this.categoriaSelected = categoria;
    this.form.setValue({
      categoria: this.categoriaSelected.categoria
    })
  }
  closeModal(): void {
    this.modalService.closeModal();
  }

}
