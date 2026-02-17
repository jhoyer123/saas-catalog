// mock/products.mock.ts

import { ProductCatalog } from "@/types/product.types";

export const mockProducts: ProductCatalog[] = [
  {
    id: "a1b2c3d4-0001-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-001",
    name_category: "Camisetas",
    name: "Camiseta Oversize Essential",
    price: 89.9,
    offer_price: 69.9,
    is_offer: true,
    is_available: true,
    display_order: 1,
    slug: "camiseta-oversize-essential",
    brand: "UrbanThread",
    description: `
      <h2>Comodidad que se nota desde el primer uso</h2>
      <p>Esta camiseta oversize está confeccionada en <strong>100% algodón peinado</strong>, 
      lo que le da una suavidad superior y mayor durabilidad frente al lavado frecuente.</p>
      <ul>
        <li>Tela: 220 g/m²</li>
        <li>Corte: oversize con hombros caídos</li>
        <li>Cuello redondo reforzado</li>
      </ul>
      <p><em>Disponible en tallas XS al XXL. Recomendamos tallar a su talla habitual.</em></p>
    `,
    images: [
      "https://i.pinimg.com/736x/75/7b/16/757b168b9219cecd607c109686294576.jpg",
      "https://i.pinimg.com/1200x/a6/85/93/a68593220d20e4a56bc50c88688bd1d8.jpg",
    ],
    created_at: "2024-11-01T10:00:00",
    updated_at: "2024-11-15T10:00:00",
  },
  {
    id: "a1b2c3d4-0002-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-002",
    name_category: "Pantalones",
    name: "Pantalón Cargo Relaxed",
    price: 159.9,
    offer_price: null,
    is_offer: false,
    is_available: true,
    display_order: 2,
    slug: "pantalon-cargo-relaxed",
    brand: "UrbanThread",
    description: `
      <h2>El pantalón que lo aguanta todo</h2>
      <p>Diseñado para quienes buscan <strong>funcionalidad sin sacrificar estilo</strong>. 
      Con 6 bolsillos funcionales y tela resistente al desgaste.</p>
      <ul>
        <li>Material: 65% poliéster, 35% algodón</li>
        <li>Bolsillos laterales con cierre</li>
        <li>Cintura ajustable con cordón interno</li>
      </ul>
      <p><em>Ideal para uso diario o actividades al aire libre.</em></p>
    `,
    images: [
      "https://i.pinimg.com/736x/8b/45/ec/8b45ec5d3d56d60a81ab2f68878dd161.jpg",
      "https://i.pinimg.com/1200x/0f/d9/90/0fd990dd798d64d9fb7fd32df8c8e1cc.jpg",
      "https://i.pinimg.com/1200x/fe/d9/95/fed995960a76e97119076968cbb97f5a.jpg",
    ],
    created_at: "2024-11-02T10:00:00",
    updated_at: "2024-11-02T10:00:00",
  },
  {
    id: "a1b2c3d4-0003-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-003",
    name_category: "Vestidos",
    name: "Vestido Midi Lino",
    price: 199.9,
    offer_price: 159.9,
    is_offer: true,
    is_available: true,
    display_order: 3,
    slug: "vestido-midi-lino",
    brand: "SoftLoom",
    description: `
      <h2>Elegancia natural en cada movimiento</h2>
      <p>Confeccionado en <strong>lino premium lavado</strong>, este vestido midi combina 
      frescura y elegancia para cualquier ocasión.</p>
      <ul>
        <li>Material: 100% lino stonewashed</li>
        <li>Largo midi (hasta la pantorrilla)</li>
        <li>Escote en V con botones decorativos</li>
      </ul>
      <p><em>Se recomienda lavar a mano o en ciclo delicado.</em></p>
    `,
    images: [
      "https://i.pinimg.com/1200x/ae/9d/0a/ae9d0ae79f1db88360f2ee6b0921d5aa.jpg",
    ],
    created_at: "2024-11-03T10:00:00",
    updated_at: "2024-11-20T10:00:00",
  },
  {
    id: "a1b2c3d4-0004-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-004",
    name_category: "Chaquetas",
    name: "Chaqueta Denim Clásica",
    price: 249.9,
    offer_price: null,
    is_offer: false,
    is_available: true,
    display_order: 4,
    slug: "chaqueta-denim-clasica",
    brand: "BlueDenim Co.",
    description: `
      <h2>Un clásico que nunca pasa de moda</h2>
      <p>La chaqueta denim que toda persona necesita en su armario. 
      Construida con <strong>denim 12 oz</strong> para mayor estructura y durabilidad.</p>
      <ul>
        <li>Material: 100% algodón denim 12 oz</li>
        <li>Bolsillos en pecho y laterales</li>
        <li>Botones metálicos antioxidantes</li>
      </ul>
      <p><em>Con el uso frecuente adquiere un desgaste natural único.</em></p>
    `,
    images: [
      "https://i.pinimg.com/1200x/c7/07/78/c707786fa83eab4dd3a94fdc8348b013.jpg",
      "https://i.pinimg.com/736x/a3/3c/a2/a33ca2ab6d0f49f1117675e9c8adb698.jpg",
    ],
    created_at: "2024-11-04T10:00:00",
    updated_at: "2024-11-04T10:00:00",
  },
  {
    id: "a1b2c3d4-0005-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-001",
    name_category: "Camisetas",
    name: "Polo Piqué Slim",
    price: 109.9,
    offer_price: null,
    is_offer: false,
    is_available: true,
    display_order: 5,
    slug: "polo-pique-slim",
    brand: "ClassicWear",
    description: `
      <h2>Presencia impecable en cada detalle</h2>
      <p>El polo que equilibra <strong>formalidad y comodidad</strong> 
      para el día a día en la oficina o una salida casual.</p>
      <ul>
        <li>Tela piqué 180 g/m²</li>
        <li>Corte slim fit</li>
        <li>Cuello y mangas con ribete a tono</li>
      </ul>
      <p><em>Disponible en 8 colores. Lavable a máquina a 30°C.</em></p>
    `,
    images: [
      "https://i.pinimg.com/736x/4e/02/9c/4e029cb5b034a25469ce96fabca99bfe.jpg",
      "https://i.pinimg.com/736x/4e/02/9c/4e029cb5b034a25469ce96fabca99bfe.jpg",
    ],
    created_at: "2024-11-05T10:00:00",
    updated_at: "2024-11-05T10:00:00",
  },
  {
    id: "a1b2c3d4-0006-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-005",
    name_category: "Accesorios",
    name: "Gorra Snapback Bordada",
    price: 59.9,
    offer_price: 44.9,
    is_offer: true,
    is_available: true,
    display_order: 6,
    slug: "gorra-snapback-bordada",
    brand: "CapLab",
    description: `
      <h2>El accesorio que completa cualquier look</h2>
      <p>Gorra snapback con <strong>bordado frontal en relieve</strong> 
      y cierre ajustable trasero. Talla única.</p>
      <ul>
        <li>Material: 80% acrílico, 20% lana</li>
        <li>Visera pre-curvada</li>
        <li>Cierre plástico ajustable</li>
      </ul>
      <p><em>Limpieza: paño húmedo solamente. No lavar a máquina.</em></p>
    `,
    images: [
      "https://i.pinimg.com/736x/d9/a6/61/d9a6614827a5b1ef4135119fb0e04398.jpg",
    ],
    created_at: "2024-11-06T10:00:00",
    updated_at: "2024-11-25T10:00:00",
  },
  {
    id: "a1b2c3d4-0007-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-002",
    name_category: "Pantalones",
    name: "Jean Straight Leg Vintage",
    price: 179.9,
    offer_price: null,
    is_offer: false,
    is_available: true,
    display_order: 7,
    slug: "jean-straight-leg-vintage",
    brand: "BlueDenim Co.",
    description: `
      <h2>El jean que nunca decepciona</h2>
      <p>Corte recto clásico con <strong>acabado vintage stonewash</strong>. 
      Fabricado con denim de alta densidad para mayor vida útil.</p>
      <ul>
        <li>Composición: 98% algodón, 2% elastano</li>
        <li>Tiro medio</li>
        <li>5 bolsillos tradicionales</li>
      </ul>
      <p><em>El elastano permite mayor libertad de movimiento sin perder la forma.</em></p>
    `,
    images: [
      "https://i.pinimg.com/1200x/89/1c/4c/891c4ce5fcce9689cf3c27b2d5578393.jpg",
      "https://i.pinimg.com/1200x/3d/b4/b6/3db4b6f6f0669224e78fa39e3d1e3955.jpg",
      "https://i.pinimg.com/736x/91/bb/be/91bbbeb67b9d5f8f5e4f2c83e4eb5163.jpg",
    ],
    created_at: "2024-11-07T10:00:00",
    updated_at: "2024-11-07T10:00:00",
  },
  {
    id: "a1b2c3d4-0008-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-003",
    name_category: "Vestidos",
    name: "Vestido Floral Wrap",
    price: 169.9,
    offer_price: null,
    is_offer: false,
    is_available: false, // agotado — útil para probar el estado "no disponible"
    display_order: 8,
    slug: "vestido-floral-wrap",
    brand: "SoftLoom",
    description: `
      <h2>Femenino, fresco y versátil</h2>
      <p>El vestido wrap con <strong>estampado floral</strong> que se adapta 
      a diferentes siluetas gracias a su diseño cruzado ajustable.</p>
      <ul>
        <li>Material: 100% viscosa fluida</li>
        <li>Cierre: lazo lateral ajustable</li>
        <li>Largo: mini (sobre la rodilla)</li>
      </ul>
      <p><em>Actualmente sin stock. Puedes activar la alerta de disponibilidad.</em></p>
    `,
    images: [
      "https://i.pinimg.com/1200x/25/8e/4a/258e4a0f1e01af82a44cec49cfa40754.jpg",
      "https://i.pinimg.com/1200x/25/8e/4a/258e4a0f1e01af82a44cec49cfa40754.jpg",
    ],
    created_at: "2024-11-08T10:00:00",
    updated_at: "2024-11-08T10:00:00",
  },
  {
    id: "a1b2c3d4-0009-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-004",
    name_category: "Chaquetas",
    name: "Bomber Satin Premium",
    price: 299.9,
    offer_price: 239.9,
    is_offer: true,
    is_available: true,
    display_order: 9,
    slug: "bomber-satin-premium",
    brand: "UrbanThread",
    description: `
      <h2>Statement piece de temporada</h2>
      <p>Bomber en <strong>satén brillante con forro polar interior</strong>. 
      El equilibrio perfecto entre estética y abrigo.</p>
      <ul>
        <li>Exterior: 100% poliéster satinado</li>
        <li>Interior: forro polar 200 g/m²</li>
        <li>Puños y cintura en canalé elástico</li>
      </ul>
      <p><em>Recomendamos talla arriba si buscas un fit más holgado.</em></p>
    `,
    images: [
      "https://i.pinimg.com/736x/ef/c7/c7/efc7c780e751968ef3f7d3922dea87e8.jpg",
      "https://i.pinimg.com/736x/ef/c7/c7/efc7c780e751968ef3f7d3922dea87e8.jpg",
      "https://i.pinimg.com/736x/ef/c7/c7/efc7c780e751968ef3f7d3922dea87e8.jpg",
    ],
    created_at: "2024-11-09T10:00:00",
    updated_at: "2024-11-28T10:00:00",
  },
  {
    id: "a1b2c3d4-0010-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-005",
    name_category: "Accesorios",
    name: "Cinturón Cuero Trenzado",
    price: 79.9,
    offer_price: null,
    is_offer: false,
    is_available: true,
    display_order: 10,
    slug: "cinturon-cuero-trenzado",
    brand: "ClassicWear",
    description: `
      <h2>El detalle que transforma un outfit</h2>
      <p>Cinturón artesanal en <strong>cuero vacuno trenzado a mano</strong>. 
      Resistente, flexible y con envejecimiento natural elegante.</p>
      <ul>
        <li>Material: cuero vacuno curtido al vegetal</li>
        <li>Hebilla: acero inoxidable plateado</li>
        <li>Tallas: S (80cm) / M (90cm) / L (100cm)</li>
      </ul>
      <p><em>El cuero mejora con el uso. Aplicar crema de cuero cada 3 meses.</em></p>
    `,
    images: [
      "https://i.pinimg.com/736x/db/23/04/db2304eddf5957dc470d07413a60176d.jpg",
      "https://i.pinimg.com/736x/db/23/04/db2304eddf5957dc470d07413a60176d.jpg",
    ],
    created_at: "2024-11-10T10:00:00",
    updated_at: "2024-11-10T10:00:00",
  },
  {
    id: "a1b2c3d4-0011-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-001",
    name_category: "Camisetas",
    name: "Camiseta Tie-Dye Artesanal",
    price: 99.9,
    offer_price: null,
    is_offer: false,
    is_available: true,
    display_order: 11,
    slug: "camiseta-tie-dye-artesanal",
    brand: null, // producto sin marca, hecho a mano
    description: `
      <h2>Cada pieza es única, como quien la usa</h2>
      <p>Proceso de teñido <strong>100% artesanal</strong>. 
      Ninguna camiseta es igual a otra — la tuya será irrepetible.</p>
      <ul>
        <li>Base: camiseta blanca 200 g/m² algodón peinado</li>
        <li>Tintes: reactivos fijados en frío (no destiñen)</li>
        <li>Variaciones de color pueden diferir levemente de la foto</li>
      </ul>
      <p><em>Lavar por separado las primeras 3 veces en agua fría.</em></p>
    `,
    images: [
      "https://i.pinimg.com/1200x/13/63/3e/13633e2d5f8a9e12bb6a4409e564d12e.jpg",
      "https://i.pinimg.com/1200x/13/63/3e/13633e2d5f8a9e12bb6a4409e564d12e.jpg",
    ],
    created_at: "2024-11-11T10:00:00",
    updated_at: "2024-11-11T10:00:00",
  },
  {
    id: "a1b2c3d4-0012-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-002",
    name_category: "Pantalones",
    name: "Legging Deportivo Compresión",
    price: 129.9,
    offer_price: 99.9,
    is_offer: true,
    is_available: true,
    display_order: 12,
    slug: "legging-deportivo-compresion",
    brand: "ActiveMove",
    description: `
      <h2>Rendimiento y estilo en cada entrenamiento</h2>
      <p>Legging de <strong>compresión media</strong> con tecnología 
      de tejido transpirable cuatro vías.</p>
      <ul>
        <li>Composición: 78% poliamida, 22% elastano</li>
        <li>Bolsillo lateral oculto para celular</li>
        <li>Cintura alta con elástico reforzado</li>
      </ul>
      <p><em>No usar suavizante de telas — reduce la elasticidad del tejido técnico.</em></p>
    `,
    images: [
      "https://i.pinimg.com/736x/c3/3f/67/c33f6748470e75a009bacf2c4b9ed4ac.jpg",
      "https://i.pinimg.com/736x/c3/3f/67/c33f6748470e75a009bacf2c4b9ed4ac.jpg",
      "https://i.pinimg.com/736x/c3/3f/67/c33f6748470e75a009bacf2c4b9ed4ac.jpg",
    ],
    created_at: "2024-11-12T10:00:00",
    updated_at: "2024-11-30T10:00:00",
  },
  {
    id: "a1b2c3d4-0013-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-004",
    name_category: "Chaquetas",
    name: "Parka Impermeable Urban",
    price: 389.9,
    offer_price: null,
    is_offer: false,
    is_available: true,
    display_order: 13,
    slug: "parka-impermeable-urban",
    brand: "UrbanThread",
    description: `
      <h2>Preparado para la ciudad y para la lluvia</h2>
      <p>Parka técnica con <strong>membrana impermeable 10.000 mm</strong> 
      y costuras selladas. Protección real sin perder el look urbano.</p>
      <ul>
        <li>Exterior: nylon ripstop tratado DWR</li>
        <li>Relleno: fibra sintética 100 g/m²</li>
        <li>Capucha desmontable con ajuste</li>
      </ul>
      <p><em>Impermeabilidad DWR puede regenerarse con calor de plancha a baja temperatura.</em></p>
    `,
    images: [
      "https://i.pinimg.com/736x/51/40/38/51403883c9eb8da46eac0e5bdb947685.jpg",
      "https://i.pinimg.com/736x/51/40/38/51403883c9eb8da46eac0e5bdb947685.jpg",
    ],
    created_at: "2024-11-13T10:00:00",
    updated_at: "2024-11-13T10:00:00",
  },
  {
    id: "a1b2c3d4-0014-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-003",
    name_category: "Vestidos",
    name: "Vestido Crochet Verano",
    price: 219.9,
    offer_price: 179.9,
    is_offer: true,
    is_available: true,
    display_order: 14,
    slug: "vestido-crochet-verano",
    brand: "SoftLoom",
    description: `
      <h2>Hecho a mano, pensado para el verano</h2>
      <p>Vestido en <strong>crochet artesanal</strong> con forro interior incluido. 
      Ideal para playa, eventos al aire libre o una tarde de brunch.</p>
      <ul>
        <li>Material exterior: hilo algodón macramé</li>
        <li>Forro: muselina de algodón</li>
        <li>Tirantes ajustables</li>
      </ul>
      <p><em>Lavar a mano con agua fría y jabón neutro. No retorcer.</em></p>
    `,
    images: [
      "https://i.pinimg.com/736x/cb/44/a8/cb44a8982420de161c6f297af9e8c76a.jpg",
    ],
    created_at: "2024-11-14T10:00:00",
    updated_at: "2024-11-29T10:00:00",
  },
  {
    id: "a1b2c3d4-0015-4e5f-a6b7-c8d9e0f1a2b3",
    store_id: "store-001",
    category_id: "cat-005",
    name_category: "Accesorios",
    name: "Bufanda Lana Merino",
    price: 89.9,
    offer_price: null,
    is_offer: false,
    is_available: true,
    display_order: 15,
    slug: "bufanda-lana-merino",
    brand: "ClassicWear",
    description: `
      <h2>Calidez premium para los días fríos</h2>
      <p>Bufanda en <strong>lana merino extrafina</strong>. 
      Más suave que la lana convencional y sin el picor característico.</p>
      <ul>
        <li>Composición: 100% lana merino 18.5 micras</li>
        <li>Dimensiones: 190 cm × 30 cm</li>
        <li>Acabado: flecos naturales en los extremos</li>
      </ul>
      <p><em>Lavar en seco o a mano con detergente especial para lana. Secar plano.</em></p>
    `,
    images: [
      "https://i.pinimg.com/1200x/f0/f1/5f/f0f15fe87e1c9f535619a4c65a3555dc.jpg",
      "https://i.pinimg.com/1200x/f0/f1/5f/f0f15fe87e1c9f535619a4c65a3555dc.jpg",
    ],
    created_at: "2024-11-15T10:00:00",
    updated_at: "2024-11-15T10:00:00",
  },
];
