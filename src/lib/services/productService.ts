import { createClient } from "@/lib/supabase/supabaseServer"
import { ProductCatalog } from "@/types/product.types"

/* export const productService = {
  async getProductsByStore(storeId: string): Promise<ProductCatalog[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(name)
      `)
      .eq("store_id", storeId)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error al obtener productos:", error)
      throw new Error("No se pudieron cargar los productos")
    }

    return (data || []).map((product) => ({
      id: product.id,
      store_id: product.store_id,
      category_id: product.category_id,
      name_category: product.category?.name || "Sin categoría",
      name: product.name,
      price: product.price,
      description: product.description,
      is_available: product.is_available,
      display_order: product.display_order || 0,
      created_at: product.created_at,
      updated_at: product.updated_at,
      is_offer: product.is_offer || false,
      offer_price: product.offer_price,
      slug: product.slug,
      brand: product.brand,
      images: product.images || [],
    }))
  },


  async getProductById(productId: string): Promise<ProductCatalog | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(name)
      `)
      .eq("id", productId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      store_id: data.store_id,
      category_id: data.category_id,
      name_category: data.category?.name || "Sin categoría",
      name: data.name,
      price: data.price,
      description: data.description,
      is_available: data.is_available,
      display_order: data.display_order || 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_offer: data.is_offer || false,
      offer_price: data.offer_price,
      slug: data.slug,
      brand: data.brand,
      images: data.images || [],
    }
  },
} */
