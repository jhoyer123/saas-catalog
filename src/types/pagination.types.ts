/**
 * 📋 TIPOS REUTILIZABLES PARA PAGINACIÓN
 * 
 * Estos tipos se pueden usar en CUALQUIER entidad (categorías, productos, etc.)
 * Solo cambia el tipo genérico <T>
 */

/**
 * Parámetros base para cualquier consulta paginada
 * @template TData - El tipo de datos que esperas recibir
 */
export interface PaginationParams {
  /** Número de página (comienza en 1) */
  page: number
  
  /** Cantidad de items por página (típicamente 10, 20, 50) */
  pageSize: number
  
  /** 
   * Término de búsqueda (opcional)
   * Se puede aplicar a múltiples campos según la implementación
   */
  search?: string
  
  /** 
   * Campo por el cual ordenar (opcional)
   * Ejemplos: 'created_at', 'name', 'price'
   */
  sortBy?: string
  
  /** 
   * Dirección del ordenamiento (opcional)
   * 'asc' = ascendente (A-Z, 0-9)
   * 'desc' = descendente (Z-A, 9-0)
   */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Respuesta estándar de una consulta paginada
 * @template TData - El tipo de datos en el array
 */
export interface PaginatedResponse<TData> {
  /** Array de datos de la página actual */
  data: TData[]
  
  /** Total de registros que coinciden con los filtros */
  total: number
  
  /** Página actual (comienza en 1) */
  page: number
  
  /** Cantidad de items por página */
  pageSize: number
  
  /** Total de páginas disponibles (calculado: total / pageSize) */
  totalPages: number
}

/**
 * 🔍 FILTROS ADICIONALES
 * 
 * Para agregar filtros personalizados, extiende este tipo
 * Ejemplo para categorías:
 * 
 * export interface CategoryFilters extends PaginationParams {
 *   store_id?: string      // Filtrar por tienda
 *   has_image?: boolean    // Solo con imagen
 * }
 */
