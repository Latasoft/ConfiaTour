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

export async function crearReserva(reservaData) {
  const { data, error } = await supabase
    .from('reservas')
    .insert([reservaData])
    .select()
  
  if (error) throw error
  return data[0]
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