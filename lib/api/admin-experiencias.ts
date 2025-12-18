import { Experiencia } from '@/types'

/**
 * Cliente API para gestión administrativa de experiencias
 * Usar solo desde componentes protegidos con AdminGuard
 */

export interface ExperienciaAdminAPI {
  getAll: (filtros?: AdminExperienciasFiltros) => Promise<ExperienciaResponse[]>
  getById: (id: string) => Promise<Experiencia>
  crear: (data: CrearExperienciaData) => Promise<Experiencia>
  actualizar: (id: string, data: Partial<Experiencia>) => Promise<Experiencia>
  eliminar: (id: string) => Promise<void>
  actualizarDisponibilidad: (id: string, disponible: boolean) => Promise<Experiencia>
}

export interface AdminExperienciasFiltros {
  categoria?: string
  disponible?: boolean
  usuario_id?: string
}

export interface CrearExperienciaData {
  usuario_id: string
  titulo: string
  descripcion: string
  categoria: string
  ubicacion: string
  precio: number
  moneda: string
  capacidad: number
  duracion: string
  fecha_inicio?: string
  fecha_fin?: string
  imagenes?: string[]
  disponible?: boolean
}

export interface ExperienciaResponse extends Experiencia {
  // Campos adicionales si los hay
}

class ExperienciaAdminAPIClient implements ExperienciaAdminAPI {
  private baseUrl = '/api/admin/experiencias'

  /**
   * Obtiene todas las experiencias con filtros opcionales
   */
  async getAll(filtros?: AdminExperienciasFiltros): Promise<ExperienciaResponse[]> {
    const params = new URLSearchParams()
    
    if (filtros?.categoria) params.append('categoria', filtros.categoria)
    if (filtros?.disponible !== undefined) params.append('disponible', String(filtros.disponible))
    if (filtros?.usuario_id) params.append('usuario_id', filtros.usuario_id)

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener experiencias')
    }

    const result = await response.json()
    return result.data || []
  }

  /**
   * Obtiene una experiencia por ID
   */
  async getById(id: string): Promise<Experiencia> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener experiencia')
    }

    const result = await response.json()
    return result.data
  }

  /**
   * Crea una nueva experiencia
   */
  async crear(data: CrearExperienciaData): Promise<Experiencia> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear experiencia')
    }

    const result = await response.json()
    return result.data
  }

  /**
   * Actualiza una experiencia completa
   */
  async actualizar(id: string, data: Partial<Experiencia>): Promise<Experiencia> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al actualizar experiencia')
    }

    const result = await response.json()
    return result.data
  }

  /**
   * Actualiza solo la disponibilidad
   */
  async actualizarDisponibilidad(id: string, disponible: boolean): Promise<Experiencia> {
    return this.actualizar(id, { disponible })
  }

  /**
   * Elimina una experiencia
   */
  async eliminar(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al eliminar experiencia')
    }
  }
}

// Instancia singleton para usar en toda la app
export const experienciaAdminAPI = new ExperienciaAdminAPIClient()
