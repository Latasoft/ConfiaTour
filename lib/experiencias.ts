/**
 * ARCHIVO DE COMPATIBILIDAD
 * Este archivo mantiene la API existente mientras migra a los nuevos servicios
 * Gradualmente se puede deprecar y eliminar
 */

import { experienciaService } from './services/experiencia.service'
import { reservaService } from './services/reserva.service'
import { supabase } from './db/supabase'

// ==================== EXPERIENCIAS ====================

export async function getExperiencias(filtros = {}) {
  return experienciaService.getExperiencias(filtros)
}

export async function getExperienciaById(id: string) {
  return experienciaService.getExperienciaById(id)
}

// ==================== RESERVAS ====================

export async function crearReserva(reservaData: any) {
  try {
    console.log('📝 Creando reserva:', reservaData)
    const reserva = await reservaService.crearReserva(reservaData)
    console.log('✅ Reserva creada:', reserva)
    return reserva
  } catch (error) {
    console.error('💥 Error creando reserva:', error)
    throw error
  }
}

export async function getReservasByUsuario(userId: string) {
  try {
    console.log('📋 Obteniendo reservas del usuario:', userId)
    const reservas = await reservaService.getReservasByUsuario(userId)
    console.log('✅ Reservas obtenidas:', reservas)
    return reservas
  } catch (error) {
    console.error('💥 Error en getReservasByUsuario:', error)
    throw error
  }
}

export async function getReservasByUser(userId: string) {
  // Alias para compatibilidad
  return getReservasByUsuario(userId)
}

export async function cancelarReserva(reservaId: string, userId: string) {
  try {
    console.log('[DEBUG] Cancelando reserva:', { reservaId, userId })
    const reserva = await reservaService.cancelarReserva(reservaId, userId)
    console.log('✅ Reserva cancelada:', reserva)
    return reserva
  } catch (error) {
    console.error('💥 Error cancelando reserva:', error)
    throw error
  }
}

export async function puedeCancelarReserva(reservaId: string, userId: string) {
  return reservaService.puedeCancelar(reservaId, userId)
}

// ==================== RESEÑAS ====================

export async function getResenasByExperiencia(experienciaId: string) {
  const { data, error } = await supabase
    .from('resenas')
    .select('*')
    .eq('experiencia_id', experienciaId)
    .order('creado_en', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function crearResena(resenaData: any) {
  try {
    const { data, error } = await supabase
      .from('resenas')
      .insert([resenaData])
      .select()
    
    if (error) {
      console.error('Error en crearResena:', error)
      throw error
    }
    
    // Recalcular rating de la experiencia
    const todasResenas = await getResenasByExperiencia(resenaData.experiencia_id)
    await experienciaService.recalcularRating(resenaData.experiencia_id, todasResenas)
    
    return data[0]
  } catch (error) {
    console.error('Error en crearResena:', error)
    throw error
  }
}
