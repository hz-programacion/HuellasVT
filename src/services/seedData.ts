import { Pet, Sponsor, SolidarityCampaign } from '../types';

/**
 * High-contrast SVG Medical Evidence & Paid Invoice data URIs for 100% offline/instant preview
 */
const SVG_PRESUPUESTO_ROCO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760">
  <rect width="600" height="760" fill="#FAF7F2"/>
  <rect x="24" y="24" width="552" height="712" rx="16" fill="#FFFFFF" stroke="#111315" stroke-width="2"/>
  <rect x="24" y="24" width="552" height="110" rx="16" fill="#111315"/>
  <text x="52" y="68" fill="#10B981" font-family="monospace" font-size="13" font-weight="bold">PRESUPUESTO QUIRÚRGICO OFICIAL · GUARDIA 24HS</text>
  <text x="52" y="98" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="bold">VETERINARIA SAN MARTÍN 24HS</text>
  <text x="52" y="120" fill="#A3A3A3" font-family="monospace" font-size="12">Av. Casey 450 · Venado Tuerto, Santa Fe · Mat. Prof. #1842</text>

  <text x="52" y="175" fill="#111315" font-family="monospace" font-size="13" font-weight="bold">PACIENTE: "ROCO" (Canino Mestizo, ~4 años, 19 kg)</text>
  <text x="52" y="198" fill="#525252" font-family="monospace" font-size="12">DIAGNÓSTICO: Fractura expuesta de fémur derecho por accidente vial</text>
  <text x="52" y="220" fill="#525252" font-family="monospace" font-size="12">BARRIO DE RESCATE: Av. Chapuis y Aufranc (Barrio San Vicente)</text>

  <line x1="52" y1="244" x2="548" y2="244" stroke="#E5E5E5" stroke-width="2"/>
  <text x="52" y="274" fill="#111315" font-family="monospace" font-size="13" font-weight="bold">DETALLE DE PRESTACIONES E INSUMOS</text>

  <text x="52" y="312" fill="#262626" font-family="monospace" font-size="13">1. Osteosíntesis con clavo intramedular + cerclaje</text>
  <text x="455" y="312" fill="#111315" font-family="monospace" font-size="13" font-weight="bold">$68.000</text>

  <text x="52" y="348" fill="#262626" font-family="monospace" font-size="13">2. Anestesia inhalatoria y monitoreo multiparamétrico</text>
  <text x="455" y="348" fill="#111315" font-family="monospace" font-size="13" font-weight="bold">$24.000</text>

  <text x="52" y="384" fill="#262626" font-family="monospace" font-size="13">3. Placas radiográficas pre y post-quirúrgicas (x2)</text>
  <text x="455" y="384" fill="#111315" font-family="monospace" font-size="13" font-weight="bold">$16.000</text>

  <text x="52" y="420" fill="#262626" font-family="monospace" font-size="13">4. Internación 48hs + analgesia endovenosa</text>
  <text x="455" y="420" fill="#111315" font-family="monospace" font-size="13" font-weight="bold">$12.000</text>

  <line x1="52" y1="454" x2="548" y2="454" stroke="#111315" stroke-width="2"/>
  <text x="52" y="490" fill="#111315" font-family="sans-serif" font-size="18" font-weight="bold">TOTAL PRESUPUESTADO (TARIFA SOLIDARIA VT)</text>
  <text x="430" y="490" fill="#FF4D38" font-family="monospace" font-size="20" font-weight="bold">$120.000 ARS</text>

  <rect x="52" y="530" width="496" height="86" rx="12" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
  <text x="72" y="558" fill="#065F46" font-family="monospace" font-size="12" font-weight="bold">✓ CUENTA DIRECTA VERIFICADA EN CLÍNICA:</text>
  <text x="72" y="580" fill="#065F46" font-family="monospace" font-size="12">Alias: VET.SANMARTIN.VT · Titular: Veterinaria San Martín SRL</text>
  <text x="72" y="600" fill="#065F46" font-family="monospace" font-size="11">Los aportes ingresan directamente a la cuenta corriente del paciente Roco.</text>

  <circle cx="460" cy="672" r="38" fill="none" stroke="#10B981" stroke-width="2.5" stroke-dasharray="5,3"/>
  <text x="426" y="670" fill="#10B981" font-family="monospace" font-size="10" font-weight="bold">VERIFICADO</text>
  <text x="424" y="684" fill="#10B981" font-family="monospace" font-size="9">HUELLA VT</text>
  <text x="52" y="680" fill="#525252" font-family="monospace" font-size="12">Firma y Sello: Dr. Mariano L. (M.P. 1842 - Santa Fe)</text>
</svg>
`)}`;

const SVG_RECETA_REFUGIO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="720" viewBox="0 0 600 720">
  <rect width="600" height="720" fill="#FAF7F2"/>
  <rect x="24" y="24" width="552" height="672" rx="16" fill="#FFFFFF" stroke="#7C3AED" stroke-width="2"/>
  <rect x="24" y="24" width="552" height="105" rx="16" fill="#7C3AED"/>
  <text x="52" y="65" fill="#FDE68A" font-family="monospace" font-size="12" font-weight="bold">PEDIDO OFICIAL DE INSUMOS Y SANIDAD · REFUGIO VERIFICADO</text>
  <text x="52" y="95" fill="#FFFFFF" font-family="sans-serif" font-size="21" font-weight="bold">PROTECTORA Y REFUGIO CANINO VENADO TUERTO</text>
  <text x="52" y="116" fill="#EDE9FE" font-family="monospace" font-size="12">Personería Jurídica #492/VT · Sede Norte (Barrio San José Obrero)</text>

  <text x="52" y="170" fill="#111315" font-family="monospace" font-size="13" font-weight="bold">LOTE SANITARIO NOVIEMBRE · 14 CACHORROS Y ADULTOS EN RECUPERACIÓN</text>
  <line x1="52" y1="190" x2="548" y2="190" stroke="#E5E5E5" stroke-width="2"/>

  <text x="52" y="230" fill="#262626" font-family="monospace" font-size="13">• 6x Bolsas Alimento Balanceado Adulto 15kg (Alta Proteína)</text>
  <text x="52" y="265" fill="#262626" font-family="monospace" font-size="13">• 3x Bolsas Alimento Cachorro 10kg (Para camada de Mora)</text>
  <text x="52" y="300" fill="#262626" font-family="monospace" font-size="13">• 4x Cajas Amoxicilina + Ácido Clavulánico 250mg</text>
  <text x="52" y="335" fill="#262626" font-family="monospace" font-size="13">• 10x Dosis Vacuna Quíntuple Canina ($60.000 ARS total)</text>

  <rect x="52" y="385" width="496" height="96" rx="12" fill="#F5F3FF" stroke="#7C3AED" stroke-width="1.5"/>
  <text x="72" y="415" fill="#5B21B6" font-family="monospace" font-size="12" font-weight="bold">🤝 CONVENIO COMERCIO AMIGO EN VENADO TUERTO:</text>
  <text x="72" y="438" fill="#5B21B6" font-family="monospace" font-size="12">Podés abonar bolsas o medicación con 20% OFF en Forrajería El Trébol</text>
  <text x="72" y="458" fill="#5B21B6" font-family="monospace" font-size="12">(Belgrano 890) y ellos lo entregan sin cargo en el Refugio.</text>

  <text x="52" y="630" fill="#525252" font-family="monospace" font-size="12">Aval Veterinario: Dra. Valeria S. · Comisión Directiva Refugio VT</text>
</svg>
`)}`;

const SVG_FACTURA_PAGADA_CHICHO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="720" viewBox="0 0 600 720">
  <rect width="600" height="720" fill="#FAF7F2"/>
  <rect x="24" y="24" width="552" height="672" rx="16" fill="#FFFFFF" stroke="#10B981" stroke-width="2.5"/>
  <rect x="24" y="24" width="552" height="105" rx="16" fill="#065F46"/>
  <text x="52" y="65" fill="#A7F3D0" font-family="monospace" font-size="13" font-weight="bold">COMPROBANTE DE PAGO Y RENDICIÓN · TRANSPARENCIA 100%</text>
  <text x="52" y="95" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="bold">FACTURA C #0004-00019482 · PAGADO</text>
  <text x="52" y="116" fill="#D1FAE5" font-family="monospace" font-size="12">Clínica Veterinaria Del Sol · Marconi y San Martín, Venado Tuerto</text>

  <text x="52" y="175" fill="#111315" font-family="monospace" font-size="13" font-weight="bold">PACIENTE: "CHICHO" (Canino Senior rescatado en Barrio Tiro Federal)</text>
  <text x="52" y="200" fill="#525252" font-family="monospace" font-size="12">CONCEPTO: Cirugía ocular reparadora + tratamiento post-operatorio completo</text>

  <line x1="52" y1="230" x2="548" y2="230" stroke="#E5E5E5" stroke-width="2"/>
  <text x="52" y="275" fill="#262626" font-family="monospace" font-size="14">Honorarios quirúrgicos oftalmológicos y anestesia</text>
  <text x="450" y="275" fill="#111315" font-family="monospace" font-size="14" font-weight="bold">$62.000</text>

  <text x="52" y="315" fill="#262626" font-family="monospace" font-size="14">Colirios antibióticos, analgésicos y controles de alta</text>
  <text x="450" y="315" fill="#111315" font-family="monospace" font-size="14" font-weight="bold">$23.000</text>

  <line x1="52" y1="355" x2="548" y2="355" stroke="#111315" stroke-width="2"/>
  <text x="52" y="395" fill="#065F46" font-family="sans-serif" font-size="20" font-weight="bold">TOTAL ABONADO CON LA COLECTA VECINAL</text>
  <text x="435" y="395" fill="#065F46" font-family="monospace" font-size="20" font-weight="bold">$85.000 ARS</text>

  <rect x="130" y="455" width="340" height="90" rx="16" fill="#ECFDF5" stroke="#10B981" stroke-width="3"/>
  <text x="165" y="495" fill="#065F46" font-family="sans-serif" font-size="24" font-weight="bold">🎉 ¡FACTURA CANCELADA!</text>
  <text x="172" y="522" fill="#047857" font-family="monospace" font-size="12">Saldo pendiente: $0,00 ARS · Alta Médica Otorgada</text>

  <text x="52" y="635" fill="#525252" font-family="monospace" font-size="12">¡Gracias a los 24 vecinos de Venado Tuerto que hicieron posible la cirugía de Chicho!</text>
</svg>
`)}`;

export const INITIAL_PETS: Pet[] = [
  {
    id: 'pet-vt-1',
    name: 'Milo',
    status: 'lost',
    species: 'dog',
    breed: 'Beagle cruza',
    color: 'Tricolor (blanco, negro y marrón claro)',
    gender: 'male',
    size: 'medium',
    age: 'young',
    barrio: 'Barrio Centro',
    addressOrReference: 'Plaza San Martín, cerca de Belgrano y Marconi',
    date: '2026-11-10',
    description:
      'Tiene collar de cuero marrón sin chapita. Es muy dócil pero se asusta con las motos y ruidos fuertes. Por favor si lo ves retenelo o avisanos.',
    collarInfo: 'Collar de cuero marrón gastado',
    photoBase64:
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 2840,
    photoOptimizedSizeKb: 46,
    authorName: 'Florencia Pellegrini',
    authorWhatsApp: '3462551423',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'pet-vt-2',
    name: 'Sin identificar (Encontrado)',
    status: 'found',
    species: 'dog',
    breed: 'Mestizo orejas caídas',
    color: 'Marrón claro y blanco en el pecho',
    gender: 'male',
    size: 'medium',
    age: 'young',
    barrio: 'Barrio Centro',
    addressOrReference: 'San Martín y 25 de Mayo (frente a la heladería)',
    date: '2026-11-11',
    description:
      'Encontrado desorientado siguiendo a la gente. Muy manso y limpio, parece recién extraviado. Lo tengo en tránsito en mi patio.',
    collarInfo: 'Sin collar',
    photoBase64:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 3100,
    photoOptimizedSizeKb: 48,
    authorName: 'Gonzalo Rossi',
    authorWhatsApp: '3462634421',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'pet-vt-3',
    name: 'Luna',
    status: 'lost',
    species: 'cat',
    breed: 'Común europeo atigrado',
    color: 'Gris con rayas negras y patitas blancas',
    gender: 'female',
    size: 'small',
    age: 'adult',
    barrio: 'Barrio Rivadavia',
    addressOrReference: 'España y Pellegrini, cerca de la Escuela Normal',
    date: '2026-11-09',
    description:
      'Gatita castrada, ojos verdes intensos. Nunca sale a la calle, se escapó por una claraboya del techo. Su familia la extraña mucho.',
    collarInfo: 'Collar violeta con cascabel plateado',
    isCastrated: true,
    isVaccinated: true,
    photoBase64:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 1950,
    photoOptimizedSizeKb: 39,
    authorName: 'Romina V.',
    authorWhatsApp: '3462418890',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'pet-vt-4',
    name: 'Gatita encontrada en techos',
    status: 'found',
    species: 'cat',
    breed: 'Atigrada gris',
    color: 'Gris rayado con pechera blanca',
    gender: 'female',
    size: 'small',
    age: 'adult',
    barrio: 'Barrio Rivadavia',
    addressOrReference: 'Alvear al 600',
    date: '2026-11-10',
    description:
      'Apareció en el techo de casa maullando con hambre. Muy cariñosa, ronronea enseguida. Tiene un collar clarito.',
    collarInfo: 'Collar gastado',
    photoBase64:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 2150,
    photoOptimizedSizeKb: 41,
    authorName: 'Esteban C.',
    authorWhatsApp: '3462529911',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'pet-vt-5',
    name: 'Simón',
    status: 'adoption',
    species: 'dog',
    breed: 'Mestizo de tamaño mediano',
    color: 'Negro azabache con corbata blanca',
    gender: 'male',
    size: 'medium',
    age: 'young',
    barrio: 'San José Obrero',
    addressOrReference: 'Refugio Canino Venado Tuerto (Sede Norte)',
    date: '2026-11-01',
    description:
      'Rescatado del abandono, ya recuperado al 100%. Super cariñoso, juguetón y sociable con otros perros y niños. Busca una familia con patio cerrado.',
    isCastrated: true,
    isVaccinated: true,
    isKidFriendly: true,
    isUrgentTransit: false,
    shelterName: 'Protectora y Refugio Canino VT',
    isVerifiedShelter: true,
    linkedCampaignId: 'camp-vt-2',
    photoBase64:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 3420,
    photoOptimizedSizeKb: 52,
    authorName: 'Carla (Voluntaria Refugio)',
    authorWhatsApp: '3462490012',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'pet-vt-6',
    name: 'Mora y sus 3 cachorros',
    status: 'adoption',
    species: 'dog',
    breed: 'Cachorros mestizos',
    color: 'Rubios y canelas',
    gender: 'female',
    size: 'small',
    age: 'puppy',
    barrio: 'Barrio Santa Fe',
    addressOrReference: 'Av. Jorge Newbery y Santa Fe',
    date: '2026-11-11',
    description:
      'Mora tuvo cría en un terreno baldío. Tienen 60 días, están desparasitados y con primera dosis de quíntuple. Compromiso de castración al cumplir los 6 meses.',
    isCastrated: false,
    isVaccinated: true,
    isKidFriendly: true,
    isUrgentTransit: true,
    shelterName: 'Huellitas Solidarias VT',
    isVerifiedShelter: true,
    linkedCampaignId: 'camp-vt-2',
    photoBase64:
      'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 2900,
    photoOptimizedSizeKb: 49,
    authorName: 'Valeria M.',
    authorWhatsApp: '3462615588',
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
  },
  {
    id: 'pet-vt-7',
    name: 'Pituco',
    status: 'resolved',
    species: 'dog',
    breed: 'Fox Terrier cruza',
    color: 'Blanco con parche negro en el ojo derecho',
    gender: 'male',
    size: 'small',
    age: 'adult',
    barrio: 'General Belgrano',
    addressOrReference: 'Chacabuco y Güemes',
    date: '2026-10-29',
    description:
      '¡VOLVIÓ A CASA! Gracias a una vecina de Ciudad Nueva que vio el cartel en la plataforma y nos llamó de inmediato.',
    collarInfo: 'Collar verde',
    photoBase64:
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 2400,
    photoOptimizedSizeKb: 43,
    authorName: 'Marcos R.',
    authorWhatsApp: '3462334455',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    resolvedAt: Date.now() - 1000 * 60 * 60 * 15,
    resolvedNotes: 'Reencontrado con su familia gracias a la red de Huella VT',
  },
  {
    id: 'pet-vt-8',
    name: 'Oliver',
    status: 'adoption',
    species: 'cat',
    breed: 'Naranjita europeo',
    color: 'Naranja atigrado con blanco',
    gender: 'male',
    size: 'medium',
    age: 'young',
    barrio: 'Ciudad Nueva',
    addressOrReference: 'Comandante Espora y Quintana',
    date: '2026-10-27',
    description:
      'Gato super mimoso de 1 año. Castrado y con análisis negativos de VIF/ViLeF. Ideal para departamento con red en ventanas.',
    isCastrated: true,
    isVaccinated: true,
    isKidFriendly: true,
    shelterName: 'Red Felina Venado Tuerto',
    isVerifiedShelter: true,
    photoBase64:
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 1800,
    photoOptimizedSizeKb: 36,
    authorName: 'Clara Domínguez',
    authorWhatsApp: '3462471199',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 16,
  },
  {
    id: 'pet-vt-9',
    name: 'Nina',
    status: 'resolved',
    species: 'dog',
    breed: 'Golden Retriever',
    color: 'Dorado claro',
    gender: 'female',
    size: 'large',
    age: 'adult',
    barrio: 'Barrio Norte',
    addressOrReference: 'Av. Santa Fe y Pueyrredón',
    date: '2026-11-04',
    description:
      'Se había escapado durante la tormenta del martes. Gracias al radar vecinal de Huella VT la retuvieron en una panadería a 6 cuadras.',
    collarInfo: 'Pretal rojo reflectivo',
    photoBase64:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 2600,
    photoOptimizedSizeKb: 44,
    authorName: 'Luciana F.',
    authorWhatsApp: '3462583310',
    applauseCount: 38,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    resolvedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    resolvedNotes: '¡Volvió en menos de 4 horas gracias al aviso de la panadería de Barrio Norte!',
  },
  {
    id: 'pet-vt-10',
    name: 'Toto',
    status: 'resolved',
    species: 'cat',
    breed: 'Siamés Red Point',
    color: 'Blanco crema con orejas anaranjadas y ojos celestes',
    gender: 'male',
    size: 'small',
    age: 'young',
    barrio: 'Tiro Federal',
    addressOrReference: 'Castelli al 1100',
    date: '2026-11-06',
    description:
      'Adoptado responsablemente a través del Santuario de Huella VT. Hoy vive feliz con su nueva familia en Barrio Tiro Federal.',
    isCastrated: true,
    isVaccinated: true,
    isKidFriendly: true,
    shelterName: 'Red Felina Venado Tuerto',
    isVerifiedShelter: true,
    photoBase64:
      'https://images.unsplash.com/photo-1513360382564-850120167725?auto=format&fit=crop&w=600&q=80',
    photoOriginalSizeKb: 2100,
    photoOptimizedSizeKb: 40,
    authorName: 'Martín & Familia',
    authorWhatsApp: '3462449102',
    applauseCount: 29,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    resolvedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    resolvedNotes: '¡Adopción responsable concretada! Toto ya es el rey de la casa.',
  },
];

export const INITIAL_SPONSORS: Sponsor[] = [
  {
    id: 'spon-vt-1',
    name: 'Veterinaria San Martín 24hs',
    category: 'veterinaria',
    tier: 'padrino_gold',
    isOnDutyToday: true,
    address: 'Av. Casey 450, Venado Tuerto',
    phone: '03462 42-1800',
    whatsApp: '3462421800',
    mapsUrl: 'https://maps.google.com/?q=Av+Casey+450+Venado+Tuerto',
    promoTitle: '15% OFF en 1ra Consulta o Vacunación',
    promoDescription: 'Mencioná HUELLA VT al solicitar tu turno o atenderte por guardia activa.',
    couponCode: 'HUELLA-SANMARTIN',
    bannerColor: '#F59E0B',
    expirationDate: '2026-12-31',
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'spon-vt-2',
    name: 'Pet Shop & Forrajería El Trébol',
    category: 'pet_shop',
    tier: 'comercio_amigo',
    isOnDutyToday: false,
    address: 'Belgrano 890, Venado Tuerto',
    phone: '03462 43-2211',
    whatsApp: '3462432211',
    mapsUrl: 'https://maps.google.com/?q=Belgrano+890+Venado+Tuerto',
    promoTitle: '20% OFF en Alimento Balanceado Super Premium',
    promoDescription:
      'En bolsas de 15kg o más de primeras marcas. Envíos sin cargo dentro de la ciudad.',
    couponCode: 'TREBOL-VT20',
    bannerColor: '#10B981',
    expirationDate: '2026-11-28',
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
  {
    id: 'spon-vt-3',
    name: 'Clínica Veterinaria Del Sol',
    category: 'veterinaria',
    tier: 'guardia_24h',
    isOnDutyToday: true,
    address: 'Marconi y San Martín, Venado Tuerto',
    phone: '03462 46-5544',
    whatsApp: '3462465544',
    mapsUrl: 'https://maps.google.com/?q=Marconi+y+San+Martin+Venado+Tuerto',
    promoTitle: 'Ecografías y Cirugías Programadas 10% OFF',
    promoDescription:
      'Equipo de diagnóstico por imágenes de alta resolución e internación monitoreada.',
    couponCode: 'SOL-HUELLA10',
    bannerColor: '#7C3AED',
    expirationDate: '2026-11-15',
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: 'spon-vt-4',
    name: 'Peluquería Canina y Spa Huellitas',
    category: 'peluqueria',
    tier: 'comercio_amigo',
    isOnDutyToday: false,
    address: 'Chacabuco 1120, Venado Tuerto',
    phone: '03462 15-689900',
    whatsApp: '3462689900',
    mapsUrl: 'https://maps.google.com/?q=Chacabuco+1120+Venado+Tuerto',
    promoTitle: 'Baño medicado + Corte higiénico con 2x1 en sesión de ozonoterapia',
    promoDescription: 'Cuidado amoroso sin jaulas. Retiro y entrega a domicilio coordinado.',
    couponCode: 'SPAHUELLAS',
    bannerColor: '#0EA5E9',
    expirationDate: '2026-11-05',
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
  },
];

/**
 * 3 Realistic Pre-Loaded Solidarity Campaigns in Venado Tuerto:
 * 1. Roco: Traumatological Surgery at 75% ($90.000 / $120.000 ARS) with Direct Veterinary Account + Supplies
 * 2. Refugio Canino VT: Verified Shelter requesting 15kg Balanced Food bags + Antibiotics + Vaccine fund
 * 3. Chicho: 100% Completed Ocular Surgery ($85.000 / $85.000 ARS) with Auto-Hidden Alias & Uploaded Paid Invoice
 */
export const INITIAL_CAMPAIGNS: SolidarityCampaign[] = [
  {
    id: 'camp-vt-1',
    petName: 'Roco',
    species: 'dog',
    barrio: 'Barrio San Vicente',
    title: 'Cirugía traumatológica de fémur para Roco',
    story:
      'Roco fue embestido en Av. Chapuis y Aufranc bajo la lluvia. Está internado estable en Veterinaria San Martín 24hs y necesita cirugía de osteosíntesis con clavo intramedular para volver a caminar. Los aportes van directo a la cuenta de la clínica.',
    helpType: 'both',
    status: 'active',
    photoBase64:
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80',
    goalAmountArs: 120000,
    confirmedAmountArs: 78000,
    pendingReviewAmountArs: 12000,
    bankAlias: 'VET.SANMARTIN.VT',
    cbuCvu: '0000003100048291038492',
    holderName: 'Veterinaria San Martín 24hs SRL',
    bankOrWallet: 'Banco Santa Fe / Mercado Pago',
    isDirectVetAccount: true,
    supplies: [
      {
        id: 'sup-vt-101',
        name: 'Cajas de Doxiciclina 100mg (Antibiótico)',
        category: 'medicina',
        targetQty: 2,
        currentQty: 1,
        fulfilled: false,
      },
      {
        id: 'sup-vt-102',
        name: 'Paquetes de Gasas Estériles + Pervinox',
        category: 'insumos',
        targetQty: 3,
        currentQty: 1,
        fulfilled: false,
      },
      {
        id: 'sup-vt-103',
        name: 'Collar Isabelino Tamaño Grande (30cm)',
        category: 'insumos',
        targetQty: 1,
        currentQty: 1,
        fulfilled: true,
      },
    ],
    medicalEvidenceBase64: SVG_PRESUPUESTO_ROCO,
    medicalEvidenceCaption:
      'Presupuesto quirúrgico firmado por Dr. Mariano L. (M.P. 1842) - Veterinaria San Martín 24hs',
    vetClinicName: 'Veterinaria San Martín 24hs (Av. Casey 450)',
    vetProfessionalName: 'Dr. Mariano L. (M.P. 1842)',
    isVerifiedShelter: true,
    shelterOrOrganizerName: 'Luciana G. (En conjunto con Vet. San Martín)',
    contactWhatsApp: '3462551423',
    contributions: [
      {
        id: 'c-1',
        donorName: 'Sofía Pellegrini',
        amountArs: 7000,
        message: '¡Pronta recuperación para Roco! Transferido recién al alias de la vete.',
        status: 'in_review',
        createdAt: Date.now() - 1000 * 60 * 24,
      },
      {
        id: 'c-2',
        donorName: 'Lucas M. (Barrio Centro)',
        amountArs: 5000,
        message: '¡Vamos Roco que salís adelante campeón!',
        status: 'in_review',
        createdAt: Date.now() - 1000 * 60 * 75,
      },
      {
        id: 'c-3',
        donorName: 'Familia Giordano',
        amountArs: 15000,
        message: 'Entre todos en Venado lo sacamos adelante.',
        status: 'confirmed',
        createdAt: Date.now() - 1000 * 60 * 210,
      },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: 'camp-vt-2',
    petId: 'pet-vt-5',
    petName: 'Manada del Refugio & Camada de Mora',
    species: 'dog',
    barrio: 'San José Obrero',
    title: 'Banco de Alimento Balanceado y Antibióticos de Invierno',
    story:
      'En el Refugio Canino de Venado Tuerto recibimos 9 rescatados nuevos esta semana (incluyendo a Mora y sus cachorros). Necesitamos reponer bolsas de alimento de 15kg, amoxicilina pediátrica y cubrir el lote de vacunas quíntuples.',
    helpType: 'both',
    status: 'active',
    photoBase64:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
    goalAmountArs: 60000,
    confirmedAmountArs: 32000,
    pendingReviewAmountArs: 4000,
    bankAlias: 'REFUGIO.CANINO.VT',
    cbuCvu: '0000003100099182736451',
    holderName: 'Asoc. Civil Protectora y Refugio Canino VT',
    bankOrWallet: 'Mercado Pago (Cuenta Oficial Protectora)',
    isDirectVetAccount: false,
    supplies: [
      {
        id: 'sup-vt-201',
        name: 'Bolsas Alimento Balanceado Adulto 15kg',
        category: 'alimento',
        targetQty: 6,
        currentQty: 2,
        fulfilled: false,
      },
      {
        id: 'sup-vt-202',
        name: 'Bolsas Alimento Cachorro 10kg',
        category: 'alimento',
        targetQty: 3,
        currentQty: 1,
        fulfilled: false,
      },
      {
        id: 'sup-vt-203',
        name: 'Cajas Amoxicilina + Ác. Clavulánico 250mg',
        category: 'medicina',
        targetQty: 4,
        currentQty: 1,
        fulfilled: false,
      },
      {
        id: 'sup-vt-204',
        name: 'Mantas polares o abrigos limpios',
        category: 'insumos',
        targetQty: 5,
        currentQty: 5,
        fulfilled: true,
      },
    ],
    medicalEvidenceBase64: SVG_RECETA_REFUGIO,
    medicalEvidenceCaption:
      'Pedido Sanitario Oficial avalado por Dra. Valeria S. - Protectora y Refugio Canino VT',
    vetClinicName: 'Equipo Sanitario Refugio Canino VT + Forrajería El Trébol',
    vetProfessionalName: 'Dra. Valeria S.',
    isVerifiedShelter: true,
    shelterOrOrganizerName: 'Protectora y Refugio Canino VT',
    contactWhatsApp: '3462490012',
    contributions: [
      {
        id: 'c-201',
        donorName: 'Martín Benítez',
        amountArs: 4000,
        message: 'Para las vacunas de los cachorritos de Mora!',
        status: 'in_review',
        createdAt: Date.now() - 1000 * 60 * 45,
      },
      {
        id: 'c-202',
        donorName: 'Panadería La Espiga VT',
        amountArs: 12000,
        message: 'Gracias por todo lo que hacen por los callejeritos.',
        status: 'confirmed',
        createdAt: Date.now() - 1000 * 60 * 320,
      },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: 'camp-vt-3',
    petName: 'Chicho (Abuelito de Tiro Federal)',
    species: 'dog',
    barrio: 'Tiro Federal',
    title: 'Cirugía ocular reparadora y medicación post-operatoria',
    story:
      'Chicho fue rescatado con una úlcera corneal severa en Barrio Tiro Federal. ¡Gracias a los vecinos de Venado Tuerto llegamos al 100% de la meta en 48 horas! Ya fue operado con éxito y adjuntamos la factura cancelada en Clínica Del Sol.',
    helpType: 'financial',
    status: 'completed',
    photoBase64:
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=600&q=80',
    goalAmountArs: 85000,
    confirmedAmountArs: 85000,
    pendingReviewAmountArs: 0,
    bankAlias: 'CLINICA.DELSOL.VT',
    cbuCvu: '0000003100011223344556',
    holderName: 'Clínica Veterinaria Del Sol',
    bankOrWallet: 'Banco Nación / Modo',
    isDirectVetAccount: true,
    supplies: [
      {
        id: 'sup-vt-301',
        name: 'Colirio Tobramicina + Ácido Hialurónico',
        category: 'medicina',
        targetQty: 2,
        currentQty: 2,
        fulfilled: true,
      },
    ],
    medicalEvidenceBase64: SVG_FACTURA_PAGADA_CHICHO,
    medicalEvidenceCaption: 'Presupuesto e Historia Clínica Oftalmológica - Clínica Del Sol',
    paidReceiptBase64: SVG_FACTURA_PAGADA_CHICHO,
    paidReceiptCaption:
      'Factura C #0004-00019482 cancelada por $85.000 ARS en Clínica Veterinaria Del Sol',
    vetClinicName: 'Clínica Veterinaria Del Sol (Marconi y San Martín)',
    vetProfessionalName: 'Dr. Gabriel F.',
    isVerifiedShelter: true,
    shelterOrOrganizerName: 'Huellitas Solidarias VT',
    contactWhatsApp: '3462615588',
    contributions: [
      {
        id: 'c-301',
        donorName: 'Mariana y Fran',
        amountArs: 10000,
        message: '¡Con esto llegamos al 100%! Qué alegría por el abuelito Chicho ❤️',
        status: 'confirmed',
        createdAt: Date.now() - 1000 * 60 * 60 * 14,
      },
      {
        id: 'c-302',
        donorName: 'Vecino Anónimo',
        amountArs: 8500,
        message: 'Fuerza Chicho querido!',
        status: 'confirmed',
        createdAt: Date.now() - 1000 * 60 * 60 * 20,
      },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 52,
  },
];
