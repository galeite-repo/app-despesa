import { Component, Inject, Optional } from '@angular/core';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {


  constructor(
    private modalService: ModalService,
    @Inject("data") public data: any,
    @Optional() @Inject('onDelete') public onDelete: (data: any) => void = () => { },
  ) {}


  deleteConfirm(): void{
    this.onDelete(this.data)
    this.closeModal();
  }


  closeModal(): void {
    this.modalService.closeModal();
  }
}
