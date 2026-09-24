/* =============================================================
   IMPORTADORA KP — DATOS DEL SITIO
   Este es el ÚNICO archivo que necesitas editar para:
   - Cambiar teléfono, redes, dirección
   - Agregar, quitar o editar vehículos
   Recuerda: GitHub Pages distingue mayúsculas y minúsculas en
   los nombres de fotos (raize.jpg ≠ Raize.jpg).
   ============================================================= */

const CONFIG = {
  nombre: "Importadora KP",

  // Logo (si la imagen no existe, se muestra el nombre en texto dorado)
  logo: "img/logo-kp.png",

  // WhatsApp: solo números, con código de país (502)
  whatsapp: "50230368005",
  telefonoVisible: "+502 3036-8005",
  mensajeWhatsApp: "Hola, vi su página web y quiero más información.",

  instagram: "importadora_kpgt",
  // Pega aquí el link completo de tu página de Facebook
  facebook: "https://www.facebook.com/profile.php?id=61593412696023",

  direccion: "Km 10.8 Ruta al Atlántico, frente a Gasolinera UNO, carril hacia la Capital, Zona 18",
  // Texto que se usa para buscar el mapa en Google Maps
  mapa: "14.652216, -90.429672",

  // Horario (déjalo vacío "" si no quieres mostrarlo)
  horario: "Lunes a sábado, 7:00 a. m. a 6:00 p. m.",

  // Portada: fotos grandes del inicio. Usa tus mejores fotos horizontales.
  portada: [
    {
      foto: "img/portada-1.jpg",
      titulo: "Autos importados de Estados Unidos, listos para rodar en Guatemala",
      texto: "Los traemos, los reparamos y los dejamos en óptimas condiciones antes de entregártelos.",
      boton: "Ver disponibles",
      link: "catalogo.html"
    },
    {
      foto: "img/portada 2.png",
      titulo: "¿Buscas un modelo en específico? Lo traemos por pedido",
      texto: "Dinos marca, modelo, año y presupuesto. Nosotros nos encargamos de encontrarlo e importarlo.",
      boton: "Hacer un pedido",
      whatsapp: "Hola, quiero cotizar un vehículo por pedido."
    },
    {
      foto: "img/portada3.png",
      titulo: "Consigna tu vehículo en nuestro predio",
      texto: "Exhibimos tu carro en la Ruta al Atlántico, a la vista de miles de personas cada día.",
      boton: "Consignar mi vehículo",
      whatsapp: "Hola, quiero consignar mi vehículo en su predio."
    }
  ]
};

/* -------------------------------------------------------------
   VEHÍCULOS DISPONIBLES
   Campos:
   id           → nombre corto sin espacios ni tildes (único)
   marca, modelo, version, anio
   precio       → solo números, sin comas (ej. 140000)
   km           → solo números (déjalo vacío "" si no lo quieres mostrar)
   transmision  → "Automática" o "Manual"
   combustible  → "Gasolina", "Diésel", "Híbrido"...
   motor, traccion, color, tipo ("SUV", "Sedán", "Pickup", "Coupé", "Hatchback")
   foto         → foto principal
   fotos        → lista de fotos extra para la galería
   descripcion  → texto libre
   Cualquier campo vacío "" simplemente no se muestra.
   ------------------------------------------------------------- */
const CATALOGO = [
  {
    id: "toyota-raize",
    marca: "Toyota",
    modelo: "Raize",
    version: "",
    anio: 2022,
    precio: 140000,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "SUV",
    foto: "img/raize.png",
    fotos: [],
    descripcion: ""
  },
  {
    id: "mazda-cx5",
    marca: "Mazda",
    modelo: "cx5",
    version: "",
    anio: 2016,
    precio: 74500,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "SUV",
    foto: "img/cx516.jpeg",
    fotos: [],
    descripcion: ""
  },

  {
    id: "mazda 2",
    marca: "Mazda",
    modelo: "2",
    version: "",
    anio: 2014,
    precio: 43000,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "SUV",
    foto: "img/mazda2.jpeg",
    fotos: [],
    descripcion: ""
  },

  {
    id: "mazda 5",
    marca: "Mazda",
    modelo: "5",
    version: "",
    anio: 2014,
    precio: 44000,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "SUV",
    foto: "img/mazda5.jpeg",
    fotos: [],
    descripcion: ""
  },

  {
    id: "mazda-cx3",
    marca: "Mazda",
    modelo: "cx3",
    version: "",
    anio: 2014,
    precio: 88000,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "SUV",
    foto: "img/mazdacx3.jpeg",
    fotos: [],
    descripcion: ""
  },

  {
    id: "honda-civic-2012",
    marca: "Honda",
    modelo: "civic",
    version: "",
    anio: 2012,
    precio: 44000,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "Sedán",
    foto: "img/civic13.jpeg",
    fotos: [],
    descripcion: ""
  },

  {
    id: "hyundai-elantra-2016",
    marca: "Hyundai",
    modelo: "Elantra",
    version: "",
    anio: 2016,
    precio: 43000,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "Sedán",
    foto: "img/elantra16.png",
    fotos: [],
    descripcion: ""
  }
];

/* -------------------------------------------------------------
   PRÓXIMOS A INGRESAR
   Mismos campos que arriba. Extras:
   llegada → texto libre, ej. "Octubre 2026" (vacío = no se muestra)
   precio  → déjalo en 0 para mostrar "Precio por confirmar"
   ------------------------------------------------------------- */
const PROXIMAMENTE = [
  {
    id: "honda-civic-2014",
    marca: "Honda",
    modelo: "Civic",
    version: "",
    anio: 2014,
    precio: 0,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "Sedán",
    foto: "img/civic14.png",
    fotos: [],
    llegada: "",
    descripcion: ""
  },
  {
    id: "ford-mustang-gt-2014",
    marca: "Ford",
    modelo: "Mustang",
    version: "GT",
    anio: 2014,
    precio: 0,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "Coupé",
    foto: "img/mustang14.png",
    fotos: [],
    llegada: "",
    descripcion: ""
  },

  {
    id: "mazda-cx5-2025",
    marca: "Mazda",
    modelo: "cx5",
    version: "",
    anio: 2025,
    precio: 0,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "Camioneta",
    foto: "img/cx52025.jpeg",
    fotos: [],
    llegada: "",
    descripcion: ""
  },

  {
    id: "tacoma-2014",
    marca: "Toyota",
    modelo: "Tacoma",
    version: "",
    anio: 2019,
    precio: 0,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "Pikup",
    foto: "img/tacoma19.jpeg",
    fotos: [],
    llegada: "",
    descripcion: ""
  },

  {
    id: "toyota-rac-2012",
    marca: "Toyota",
    modelo: "Rav",
    version: "",
    anio: 2012,
    precio: 0,
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    traccion: "",
    color: "",
    tipo: "Camioneta",
    foto: "img/rav12.jpeg",
    fotos: [],
    llegada: "",
    descripcion: ""
  },
];
