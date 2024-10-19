import {
    Injectable,
    ComponentFactoryResolver,
    ApplicationRef,
    Injector,
    ComponentRef,
    Type,
  } from '@angular/core';
  
  @Injectable({
    providedIn: 'root',
  })
  export class ModalService {
    private modalComponentRef!: ComponentRef<any>;
  
    constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private appRef: ApplicationRef,
      private injector: Injector
    ) {}
  
    openModal({
      component,
      inputs = {},
    }: {
      component: Type<any>;
      inputs?: { [key: string]: any };
    }): void {
      const providers = Object.entries(inputs).map(([key, value]) => ({
        provide: key,
        useValue: value,
      }));
  
      const injector = Injector.create({
        providers,
        parent: this.injector,
      });
  
      const factory = this.componentFactoryResolver.resolveComponentFactory(component);
      this.modalComponentRef = factory.create(injector);
  
      this.appRef.attachView(this.modalComponentRef.hostView);
      const domElem = (this.modalComponentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    }
  
    closeModal(): void {
      if (this.modalComponentRef) {
        this.appRef.detachView(this.modalComponentRef.hostView);
        this.modalComponentRef.destroy();
      }
    }
  }
  