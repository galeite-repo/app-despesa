import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

interface LoginForm {
  email: FormControl<null | string>;
  password: FormControl<null | string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, AlertComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @ViewChild(AlertComponent) alertComponent!: AlertComponent;

  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  form = this._formBuilder.group<LoginForm>({
    email: this._formBuilder.control(null, [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control(null, [Validators.required]),
  });

  async submit() {
    if (this.form.invalid) return;

    try {
       const data = await this._authService.login({
        email: this.form.value.email ?? '',
        password: this.form.value.password ?? '',
      });
      if(data.error){
        this.alertComponent.showAlert("Erro", "Usuário ou senha inválidos");
      }else{
        this._router.navigateByUrl('/');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.alertComponent.showAlert("Erro", "Usuário ou senha inválidos");
        console.error(error);
      }
    }
  }

  async authWithGoogle() {
    try {
      await this._authService.signInWithGoogle()
    } catch (error) {
      console.log(error);
    }
  }
  async authWithGithub() {
    try {
      await this._authService.signInWithGithub()
    } catch (error) {
      console.log(error);
    }
  }
}
