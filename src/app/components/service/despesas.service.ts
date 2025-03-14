import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from '../../shared/supabase.service';
import { AuthService } from '../auth/auth.service';
import { Categoria } from './categoria.service';

export interface Despesa {
  id: string;
  recorrente: boolean;
  data: string;
  valor: number;
  descricao: string;
  user_id: string;
  categoria?: Categoria;
  categoria_id: string;
  status: boolean;
  recorrente_ref?: number;
}
interface DespesaState {
  despesas: Despesa[];
  despesasFixas: Despesa[];
  despesasGeral: Despesa[];
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class DespesasService {
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  private _authService = inject(AuthService);

  private _state = signal<DespesaState>({
    despesas: [],
    despesasGeral: [],
    despesasFixas: [],
    loading: false,
    error: false,
  });

  despesas = computed(() => this._state().despesas);
  despesasFixas = computed(() => this._state().despesasFixas);
  despesasGeral = computed(() => this._state().despesasGeral);
  loading = computed(() => this._state().loading);
  error = computed(() => this._state().error);


  async getAllGeral(mes: number, ano: number) {
    this._state.update((state) => ({
      ...state,
      despesasGeral: [],
    }));
    const inicioDoMes = new Date(ano, mes - 1, 1).toISOString().split('T')[0];
    // Último dia do mês
    const fimDoMes = new Date(ano, mes, 0).toISOString().split('T')[0];
    try {
      this._state.update((state) => ({
        ...state,
        loading: true,
      }));
      const {
        data: { session },
      } = await this._authService.session();
      const { data } = await this._supabaseClient
        .from('despesa')
        .select(`*, categoria(*)`)
        .eq('user_id', session?.user.id)
        .gte('data', inicioDoMes)
        .lte('data', fimDoMes)
        .order('data', { ascending: false })
        .returns<Despesa[]>();
      if (data && data.length > 0) {
        this._state.update((state) => ({
          ...state,
          despesasGeral: data,
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
  async getAll(mes: number, ano: number) {
    this._state.update((state) => ({
      ...state,
      despesas: [],
    }));
    const inicioDoMes = new Date(ano, mes - 1, 1).toISOString().split('T')[0];
    // Último dia do mês
    const fimDoMes = new Date(ano, mes, 0).toISOString().split('T')[0];
    try {
      this._state.update((state) => ({
        ...state,
        loading: true,
      }));
      const {
        data: { session },
      } = await this._authService.session();
      const { data } = await this._supabaseClient
        .from('despesa')
        .select(`*, categoria(*)`)
        .eq('user_id', session?.user.id)
        .eq('recorrente', false)
        .gte('data', inicioDoMes)
        .lte('data', fimDoMes)
        .order('data', { ascending: false })
        .returns<Despesa[]>();
      if (data && data.length > 0) {
        this._state.update((state) => ({
          ...state,
          despesas: data,
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
  async getAllFixas(mes: number, ano: number) {
    const inicioDoMes = new Date(ano, mes - 1, 1).toISOString().split('T')[0];
    const fimDoMes = new Date(ano, mes, 0).toISOString().split('T')[0];
    this._state.update((state) => ({
      ...state,
      despesasFixas: [],
    }));
    try {
      this._state.update((state) => ({
        ...state,
        loading: true,
      }));
      const {
        data: { session },
      } = await this._authService.session();
      const { data } = await this._supabaseClient
        .from('despesa')
        .select(`*, categoria(*)`)
        .eq('user_id', session?.user.id)
        .eq('recorrente', true)
        .gte('data', inicioDoMes)
        .lte('data', fimDoMes)
        .order('data', { ascending: false })
        .returns<Despesa[]>();
      if (data && data.length > 0) {
        this._state.update((state) => ({
          ...state,
          despesasFixas: data,
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

  async putRecorrencia(recorrente_ref: number, despesa: Despesa) {
    try {
      const {
        data: { session },
      } = await this._authService.session();
      const { data } = await this._supabaseClient
        .from('despesa')
        .select(`*, categoria(*)`)
        .eq('user_id', session?.user.id)
        .eq('recorrente', true)
        .eq('recorrente_ref', recorrente_ref)
        .order('data', { ascending: false })
        .returns<Despesa[]>();

      if (data?.length == 0) {
        this.insert(despesa)
      }
    } catch (error) {
    }
  }

  async insert(despesa: Despesa): Promise<any> {
    try {
      const {
        data: { session },
      } = await this._authService.session();

      const { data, error } = await this._supabaseClient.from('despesa').insert({
        user_id: session?.user.id,
        descricao: despesa.descricao,
        recorrente: despesa.recorrente,
        status: despesa.status,
        categoria_id: despesa.categoria_id,
        data: despesa.data,
        valor: despesa.valor,
        recorrente_ref: despesa.recorrente_ref,
      });

      if (error) {
        throw error; // Lança o erro se houver
      }

      return data; // Retorna os dados da resposta se tudo correr bem
    } catch (error) {
      // Atualiza o estado com o erro
      this._state.update((state) => ({
        ...state,
        error: true,
      }));

      // Rejeita a Promise com o erro
      throw error;
    }
  }


  async update(despesa: Despesa): Promise<any> {
    try {
      await this._supabaseClient
        .from('despesa')
        .update<Despesa>({
          ...despesa,
        })
        .eq('id', despesa.id);
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        error: true,
      }));
    }
  }

  async updateStatus(despesa: { status: boolean; id: string }) {
    try {
      await this._supabaseClient
        .from('despesa')
        .update({
          ...despesa,
        })
        .eq('id', despesa.id);
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        error: true,
      }));
    }
  }

  async delete(id: string) {
    try {
      await this._supabaseClient.from('despesa').delete().eq('id', id);
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        error: true,
      }));
    }
  }
}
