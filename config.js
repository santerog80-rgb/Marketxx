
// MozCommerce - Configuration File

// Supabase Configuration
// NOTE: Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://fwacwpwdqkmykowxmffx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ci9XWHYXUqk01PZT5Jp0ug_VIrzP9cd';

// Initialize Supabase client
let supabase;

try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
} catch (error) {
    console.error('Error initializing Supabase:', error);
}

// Currency Exchange Rates (base: MZN)
const EXCHANGE_RATES = {
    MZN: 1.0,
    USD: 0.0156,
    EUR: 0.0143,
    ZAR: 0.28,
    GBP: 0.0122,
    BRL: 0.078,
    ZMW: 0.24
};

// Currency Symbols
const CURRENCY_SYMBOLS = {
    MZN: 'MT',
    USD: '$',
    EUR: '€',
    ZAR: 'R',
    GBP: '£',
    BRL: 'R$',
    ZMW: 'ZK'
};

// App Configuration
const APP_CONFIG = {
    appName: 'MozCommerce',
    version: '1.0.0',
    itemsPerPage: 12,
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxImages: 6
};

// Categories Data
const CATEGORIES = [
    { id: 1, name: 'Eletr\u00f4nicos', icon: 'fa-laptop' },
    { id: 2, name: 'M\u00f3veis', icon: 'fa-couch' },
    { id: 3, name: 'Vestu\u00e1rio', icon: 'fa-tshirt' },
    { id: 4, name: 'Ve\u00edculos', icon: 'fa-car' },
    { id: 5, name: 'Im\u00f3veis', icon: 'fa-home' },
    { id: 6, name: 'Esportes', icon: 'fa-futbol' },
    { id: 7, name: 'Livros', icon: 'fa-book' },
    { id: 8, name: 'M\u00fasica', icon: 'fa-music' },
    { id: 9, name: 'Artigos Infantis', icon: 'fa-baby' },
    { id: 10, name: 'Jardim', icon: 'fa-seedling' },
    { id: 11, name: 'Sa\u00fade', icon: 'fa-heartbeat' },
    { id: 12, name: 'Alimentos', icon: 'fa-utensils' }
];

// Subcategories
const SUBCATEGORIES = {
    1: ['Computadores', 'Smartphones', 'Tablets', 'Acessesorios', 'Televis\u00f5es'],
    2: ['Sof\u00e1s', 'Mesas', 'Cadeiras', 'Camas', 'Arm\u00e1rios'],
    3: ['Homens', 'Mulheres', 'Crian\u00e7as', 'Cal\u00e7ados', 'Acess\u00f3rios'],
    4: ['Carros', 'Motos', 'Pe\u00e7as', 'Acess\u00f3rios'],
    5: ['Casas', 'Apartamentos', 'Terrenos', 'Escrit\u00f3rios'],
    6: ['Futebol', 'Academia', 'Ciclismo', 'Nata\u00e7\u00e3o'],
    7: ['Romance', 'Fic\u00e7\u00e3o', 'Educa\u00e7\u00e3o', 'Infantil'],
    8: ['Instrumentos', '\u00c1udio', 'Vinil'],
    9: ['Roupas', 'Brinquedos', 'Acess\u00f3rios'],
    10: ['Plantas', 'Ferramentas', 'Decora\u00e7\u00e3o'],
    11: ['Medicamentos', 'Suplementos', 'Equipamentos'],
    12: ['Bebidas', 'Gr\u00e3os', 'Snacks', 'Congelados']
};

// Mozambique Provinces
const PROVINCES = [
    'Maputo Cidade',
    'Maputo Prov\u00edncia',
    'Gaza',
    'Inhambane',
    'Sofala',
    'Manica',
    'Tete',
    'Zamb\u00e9zia',
    'Nampula',
    'Niassa',
    'Cabo Delgado'
];

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        EXCHANGE_RATES,
        CURRENCY_SYMBOLS,
        APP_CONFIG,
        CATEGORIES,
        SUBCATEGORIES,
        PROVINCES
    };
}


