import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from '../../shared/supabase.service';
import { AuthService } from '../auth/auth.service';

export interface Categoria {
  id: string;
  categoria: string;
  user_id?: string;
}
interface CategoriaState {
  categorias: Categoria[];
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private _authService = inject(AuthService);

  private _state = signal<CategoriaState>({
    categorias: [],
    loading: false,
    error: false,
  });

  categorias = computed(() => this._state().categorias);
  loading = computed(() => this._state().loading);
  error = computed(() => this._state().error);

  async getAll() {
    try {
      this._state.update((state) => ({
        ...state,
        loading: true,
      }));
      const {
        data: { session },
      } = await this._authService.session();
      const { data } = await this._supabaseClient
        .from('categoria')
        .select()
        .order('categoria', { ascending: true })
        .eq('user_id', session?.user.id)
        .returns<Categoria[]>();
      if (data && data.length > 0) {
        this._state.update((state) => ({
          ...state,
          categorias: data,
        }));
      }
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        error: true,
      }));
    } finally {
      this._state.update((state) => ({
        ...state,
        loading: false,
      }));
    }
  }

  async insert(categoria: { categoria: string; }) {
    try {
      const {
        data: { session },
      } = await this._authService.session();
      const response = await this._supabaseClient.from('categoria').insert({
        user_id: session?.user.id,
        categoria: categoria.categoria
      });
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        error: true,
      }));
    }
  }

  async update(categoria: { categoria: string; id: string }) {
    try {
      await this._supabaseClient
        .from('categoria')
        .update<Categoria>({
          ...categoria,
        })
        .eq('id', categoria.id);
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        error: true,
      }));
    }
  }



  async delete(id: string) {
    try {
      await this._supabaseClient.from('categoria').delete().eq('id', id);
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        error: true,
      }));
    }
  }
}
