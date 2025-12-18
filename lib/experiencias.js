import { supabase } from './supabaseClient'

export async function getExperiencias(filtros = {}) {
  let query = supabase
    .from('experiencias')
    .select('*')
    .eq('disponible', true)

  // Aplicar filtros
  if (filtros.categoria) {
    query = query.eq('categoria', filtros.categoria)
  }
  
  if (filtros.ubicacion) {
    query = query.ilike('ubicacion', `%${filtros.ubicacion}%`)
  }
  
  if (filtros.precioMin) {
    query = query.gte('precio', filtros.precioMin)
  }
  
  if (filtros.precioMax) {
    query = query.lte('precio', filtros.precioMax)
  }
  
  if (filtros.fechaInicio) {
    query = query.gte('fecha_inicio', filtros.fechaInicio)
  }
  
  if (filtros.busqueda) {
    query = query.or(`titulo.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`)
  }

  const { data, error } = await query.order('creado_en', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getExperienciaById(id) {
  const { data, error } = await supabase
    .from('experiencias')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getResenasByExperiencia(experienciaId) {
  const { data, error } = await supabase
    .from('resenas')
    .select('*')
    .eq('experiencia_id', experienciaId)
    .order('creado_en', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * @deprecated USAR: ReservasAPI.crear() de lib/api/reservas.ts
 * Esta función creará reservas de forma insegura (usuario_id desde cliente).
 * La nueva API valida la autenticación en el servidor.
 * 
 * Migración:
 * - Antes: await crearReserva({ usuario_id: user.id, ... })
 * - Ahora: await ReservasAPI.crear({ ... }) // usuario_id automático
 * 
 * PLANIFICADO PARA ELIMINAR: Q1 2025
 */
export async function crearReserva(reservaData) {
  console.warn('[DEPRECATED] crearReserva() - Usar ReservasAPI.crear() en su lugar')
  
  try {
    console.log('📝 Creando reserva:', reservaData)
    
    const { data, error } = await supabase
      .from('reservas')
      .insert([{
        ...reservaData,
        creado_en: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('[ERROR] Error en crearReserva:', error)
      throw error
    }

    console.log('✅ Reserva creada:', data)
    return data
  } catch (error) {
    console.error('💥 Error creando reserva:', error)
    throw error
  }
}

export async function crearResena(resenaData) {
  try {
    const { data, error } = await supabase
      .from('resenas')
      .insert([resenaData])
      .select()
    
    if (error) {
      console.error('Error en crearResena:', error)
      throw error
    }
    return data[0]
  } catch (error) {
    console.error('Error en crearResena:', error)
    throw error
  }
}

export async function getReservasByUser(userId) {
  try {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        experiencias (
          id,
          titulo,
          imagenes
        )
      `)
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })
    
    if (error) {
      console.error('Error en getReservasByUser:', error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Error en getReservasByUser:', error)
    return []
  }
}

/**
 * @deprecated USAR: ReservasAPI.obtenerMias() de lib/api/reservas.ts
 * Esta función accede directamente a Supabase desde el cliente.
 * La nueva API valida la autenticación y solo devuelve reservas del usuario actual.
 * 
 * Migración:
 * - Antes: await getReservasByUsuario(user.id)
 * - Ahora: await ReservasAPI.obtenerMias() // sin parámetros
 * 
 * PLANIFICADO PARA ELIMINAR: Q1 2025
 */
export async function getReservasByUsuario(userId) {
  console.warn('[DEPRECATED] getReservasByUsuario() - Usar ReservasAPI.obtenerMias() en su lugar')
  
  try {
    console.log('📋 Obteniendo reservas del usuario:', userId)
    
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        experiencias (
          id,
          titulo,
          descripcion,
          categoria,
          ubicacion,
          precio,
          moneda,
          imagenes,
          duracion
        )
      `)
      .eq('usuario_id', userId)
      .order('fecha_reserva', { ascending: false })

    if (error) {
      console.error('[ERROR] Error obteniendo reservas:', error)
      throw error
    }

    console.log('✅ Reservas obtenidas:', data)
    return data || []
  } catch (error) {
    console.error('💥 Error en getReservasByUsuario:', error)
    throw error
  }
}

/**
 * @deprecated USAR: ReservasAPI.cancelar() de lib/api/reservas.ts
 * Esta función no valida la regla de 24 horas ni envía emails.
 * La nueva API incluye validación completa y envío de emails automático.
 * 
 * Migración:
 * - Antes: await cancelarReserva(reservaId, user.id)
 * - Ahora: await ReservasAPI.cancelar(reservaId) // sin userId
 * 
 * PLANIFICADO PARA ELIMINAR: Q1 2025
 */
export async function cancelarReserva(reservaId, userId) {
  console.warn('[DEPRECATED] cancelarReserva() - Usar ReservasAPI.cancelar() en su lugar')
  
  try {
    console.log('[DEBUG] Cancelando reserva:', { reservaId, userId })
    
    // Verificar que la reserva pertenezca al usuario
    const { data: reserva, error: checkError } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', reservaId)
      .eq('usuario_id', userId)
      .single()

    if (checkError) {
      console.error('[ERROR] Error verificando reserva:', checkError)
      throw new Error('Reserva no encontrada')
    }

    if (reserva.estado === 'cancelada') {
      throw new Error('La reserva ya está cancelada')
    }

    // Actualizar estado a cancelada
    const { data, error } = await supabase
      .from('reservas')
      .update({
        estado: 'cancelada',
        fecha_cancelacion: new Date().toISOString()
      })
      .eq('id', reservaId)
      .eq('usuario_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[ERROR] Error cancelando reserva:', error)
      throw error
    }

    console.log('✅ Reserva cancelada:', data)
    return data
  } catch (error) {
    console.error('💥 Error en cancelarReserva:', error)
    throw error
  }
}

// Verificar si puede cancelar (ej: 24 horas antes)
export function puedecancelarReserva(fechaExperiencia, fechaReserva) {
  const ahora = new Date()
  const fechaExp = new Date(fechaExperiencia)
  const diferenciaDias = (fechaExp - ahora) / (1000 * 60 * 60 * 24)
  
  // Permitir cancelar si faltan más de 1 día
  return diferenciaDias > 1
}