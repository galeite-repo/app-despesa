import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../shared/supabase.service';
import {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _supabase = inject(SupabaseService).supabaseClient;

  constructor() {
    this._supabase.auth.onAuthStateChange((session) => {
    });
  }
  session() {
    return this._supabase.auth.getSession();
  }

  signup(credentials: SignUpWithPasswordCredentials) {
    return this._supabase.auth.signUp(credentials);
  }
  async login(credentials: SignInWithPasswordCredentials) {
    return await this._supabase.auth.signInWithPassword(credentials)
  }
  async signInWithGoogle() {
    const { data, error } = await this._supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Erro ao autenticar com o Google:', error.message);
    } else {
      console.log('Usuário autenticado com sucesso:', data);
    }
  }
  async signInWithGithub() {
    const { data, error } = await this._supabase.auth.signInWithOAuth({
      provider: 'github',
    });

    if (error) {
      console.error('Erro ao autenticar com o Github:', error.message);
    } else {
      console.log('Usuário autenticado com sucesso:', data);
    }
  }
  logout() {
    return this._supabase.auth.signOut();
  }
}
