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

interface SignUpForm {
  email: FormControl<null | string>;
  password: FormControl<null | string>;
}
@Component({
  selector: 'app-auth-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, AlertComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class AuthSignupComponent {
  @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  form = this._formBuilder.group<SignUpForm>({
    email: this._formBuilder.control(null, [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control(null, [Validators.required]),
  });

  async submit() {
    if (this.form.invalid) return;

    try {
      const { error } = await this._authService.signup({
        email: this.form.value.email ?? '',
        password: this.form.value.password ?? '',
      });

      if (error) {
        throw error; // Lança o erro para o bloco catch
      }
      this.alertComponent.showAlert("Sucesso", "Usuário criado com sucesso.");
      await this._authService.login({
        email: this.form.value.email ?? '',
        password: this.form.value.password ?? '',
      });
      this._router.navigateByUrl('/');
    } catch (error: any) {
      // Verifica se o erro tem um código e uma mensagem
      const errorCode = error.code; // Obtém o código de erro
      const errorMessage = error.message || "Algo deu errado."; // Obtém a mensagem de erro ou usa uma mensagem padrão

      // Exibe uma mensagem mais específica com base no código de erro
      switch (errorCode) {
        case 'user_already_exists':
          this.alertComponent.showAlert("Erro", "O usuário já está registrado.");
          break;
        // Adicione mais casos conforme necessário
        default:
          this.alertComponent.showAlert("Erro", errorMessage);
          break;
      }

      console.error(error); // Para debugar o erro no console
    }
  }
}
