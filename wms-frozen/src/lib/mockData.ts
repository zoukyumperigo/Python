import type {
  User, ProductCategory, Product, Zone, Aisle, Shelf, Location,
  Supplier, Customer, StockLot, StockMovement, Receiving, ReceivingItem,
  ShippingOrder, ShippingOrderItem, PickingTask, Inventory, Task, Divergence
} from '@/types'

export const users: User[] = [
  { id: 'u1', name: 'Admin Sistema', email: 'admin@wmsfrozen.pt', role: 'ADMIN', active: true, createdAt: '2024-01-01' },
  { id: 'u2', name: 'João Gestor', email: 'joao@wmsfrozen.pt', role: 'WAREHOUSE_MANAGER', active: true, createdAt: '2024-01-05' },
  { id: 'u3', name: 'Carlos Operador', email: 'carlos@wmsfrozen.pt', role: 'OPERATOR', active: true, createdAt: '2024-01-10' },
  { id: 'u4', name: 'Ana Compras', email: 'ana@wmsfrozen.pt', role: 'PURCHASING', active: true, createdAt: '2024-01-10' },
  { id: 'u5', name: 'Miguel Expedição', email: 'miguel@wmsfrozen.pt', role: 'SHIPPING', active: true, createdAt: '2024-01-15' },
  { id: 'u6', name: 'Sofia Operadora', email: 'sofia@wmsfrozen.pt', role: 'OPERATOR', active: true, createdAt: '2024-02-01' },
]

export const categories: ProductCategory[] = [
  { id: 'cat1', name: 'Peixe e Marisco', description: 'Peixe, marisco e frutos do mar', color: '#3B82F6', active: true },
  { id: 'cat2', name: 'Carne e Aves', description: 'Carnes bovinas, suínas e aves', color: '#EF4444', active: true },
  { id: 'cat3', name: 'Legumes e Vegetais', description: 'Legumes e vegetais congelados', color: '#10B981', active: true },
  { id: 'cat4', name: 'Refeições Prontas', description: 'Refeições pré-preparadas congeladas', color: '#F59E0B', active: true },
  { id: 'cat5', name: 'Dim Sum e Pastelaria', description: 'Dim sum, pão e pastelaria chinesa', color: '#8B5CF6', active: true },
  { id: 'cat6', name: 'Tofu e Derivados', description: 'Tofu fresco, seco e derivados de soja', color: '#F97316', active: true },
  { id: 'cat7', name: 'Noodles e Massas', description: 'Noodles, massas e arroz', color: '#06B6D4', active: true },
]

export const products: Product[] = [
  {
    id: 'p1', code: 'PX001', name: 'Camarão Tigre Jumbo 16/20', nameZh: '大虎虾16/20', categoryId: 'cat1',
    brand: 'Ocean Star', unit: 'BOX', weightPerBox: 4, barcode: '5601234560001', temperature: -18,
    minStock: 50, idealStock: 200, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 730,
    aliases: ['camarao tigre', 'tiger prawn', '大虎虾'], currentStock: 145, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p2', code: 'PX002', name: 'Lula em Anéis 500g', nameZh: '鱿鱼圈500g', categoryId: 'cat1',
    brand: 'SeaFresh', unit: 'BOX', weightPerBox: 10, barcode: '5601234560002', temperature: -18,
    minStock: 30, idealStock: 120, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 540,
    aliases: ['lula aneis', 'squid rings'], currentStock: 85, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p3', code: 'PX003', name: 'Polvo Cozido IQF kg', nameZh: '熟章鱼IQF', categoryId: 'cat1',
    brand: 'OceanFresh', unit: 'BOX', weightPerBox: 5, barcode: '5601234560003', temperature: -18,
    minStock: 20, idealStock: 80, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 720,
    aliases: ['polvo cozido', 'cooked octopus'], currentStock: 12, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p4', code: 'CM001', name: 'Frango Inteiro IQF 900g-1.1kg', nameZh: '整鸡IQF', categoryId: 'cat2',
    brand: 'PoultryFarm', unit: 'BOX', weightPerBox: 15, barcode: '5601234560010', temperature: -18,
    minStock: 100, idealStock: 400, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 365,
    aliases: ['frango inteiro', 'whole chicken', '整鸡'], currentStock: 320, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p5', code: 'CM002', name: 'Pato Pequim Inteiro 2.2kg', nameZh: '北京烤鸭整只', categoryId: 'cat2',
    brand: 'PekingDuck', unit: 'BOX', weightPerBox: 4.4, barcode: '5601234560011', temperature: -18,
    minStock: 30, idealStock: 120, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 365,
    aliases: ['pato pequim', 'peking duck', '北京鸭'], currentStock: 67, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p6', code: 'CM003', name: 'Barriga de Porco IQF', nameZh: '五花肉IQF', categoryId: 'cat2',
    brand: 'PorkFresh', unit: 'BOX', weightPerBox: 10, barcode: '5601234560012', temperature: -18,
    minStock: 50, idealStock: 200, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 365,
    aliases: ['barriga porco', 'pork belly', '五花肉'], currentStock: 8, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p7', code: 'LG001', name: 'Edamame Cozido 500g', nameZh: '毛豆500g', categoryId: 'cat3',
    brand: 'GreenVeg', unit: 'BOX', weightPerBox: 10, barcode: '5601234560020', temperature: -18,
    minStock: 40, idealStock: 160, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 730,
    aliases: ['edamame', '毛豆', 'soja verde'], currentStock: 220, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p8', code: 'LG002', name: 'Cogumelos Shiitake Fatiados 1kg', nameZh: '香菇片1kg', categoryId: 'cat3',
    brand: 'MushroomPlus', unit: 'BOX', weightPerBox: 5, barcode: '5601234560021', temperature: -18,
    minStock: 20, idealStock: 80, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 540,
    aliases: ['shiitake fatiado', 'sliced shiitake', '香菇片'], currentStock: 44, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p9', code: 'DS001', name: 'Har Gow (Caixa 40un)', nameZh: '虾饺40个', categoryId: 'cat5',
    brand: 'DimSumHouse', unit: 'BOX', weightPerBox: 0.8, barcode: '5601234560030', temperature: -18,
    minStock: 100, idealStock: 400, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 365,
    aliases: ['har gow', '虾饺', 'dumpling camarao'], currentStock: 380, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p10', code: 'DS002', name: 'Siu Mai (Caixa 40un)', nameZh: '烧卖40个', categoryId: 'cat5',
    brand: 'DimSumHouse', unit: 'BOX', weightPerBox: 0.8, barcode: '5601234560031', temperature: -18,
    minStock: 80, idealStock: 320, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 365,
    aliases: ['siu mai', '烧卖', 'dumpling carne'], currentStock: 290, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p11', code: 'DS003', name: 'Char Siu Bao (Pão recheado carne) 100g x 10', nameZh: '叉烧包100g', categoryId: 'cat5',
    brand: 'BaoBuns', unit: 'BOX', weightPerBox: 1, barcode: '5601234560032', temperature: -18,
    minStock: 60, idealStock: 240, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 180,
    aliases: ['char siu bao', '叉烧包', 'pao recheado'], currentStock: 156, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p12', code: 'TF001', name: 'Tofu Firme 500g', nameZh: '老豆腐500g', categoryId: 'cat6',
    brand: 'TofuMaster', unit: 'BOX', weightPerBox: 6, barcode: '5601234560040', temperature: -4,
    minStock: 30, idealStock: 120, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 90,
    aliases: ['tofu firme', '老豆腐', 'firm tofu'], currentStock: 55, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p13', code: 'ND001', name: 'Udon Noodles 200g x 5', nameZh: '乌冬面200g', categoryId: 'cat7',
    brand: 'NoodleCo', unit: 'BOX', weightPerBox: 1, barcode: '5601234560050', temperature: -18,
    minStock: 50, idealStock: 200, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 365,
    aliases: ['udon', '乌冬面', 'noodles udon'], currentStock: 178, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p14', code: 'PX004', name: 'Vieira c/ Coral Meia Concha IQF', nameZh: '带珊瑚扇贝半壳', categoryId: 'cat1',
    brand: 'PremiumSea', unit: 'BOX', weightPerBox: 5, barcode: '5601234560004', temperature: -18,
    minStock: 15, idealStock: 60, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 540,
    aliases: ['vieira coral', 'scallop', '扇贝'], currentStock: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
  {
    id: 'p15', code: 'RF001', name: 'Pato Assado Desfiado 1kg', nameZh: '烤鸭肉丝1kg', categoryId: 'cat4',
    brand: 'ReadyMeal', unit: 'BOX', weightPerBox: 4, barcode: '5601234560060', temperature: -18,
    minStock: 20, idealStock: 80, active: true, requiresLot: true, requiresExpiry: true, shelfLifeDays: 365,
    aliases: ['pato assado', 'roast duck', '烤鸭'], currentStock: 35, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  },
]

export const zones: Zone[] = [
  { id: 'z1', code: 'A', name: 'Zona Receção', temperature: -5, description: 'Câmara de receção e conferência', active: true },
  { id: 'z2', code: 'B', name: 'Zona Congelados -18°C', temperature: -18, description: 'Armazenamento principal de congelados', active: true },
  { id: 'z3', code: 'C', name: 'Zona Picking', temperature: -15, description: 'Área de preparação de pedidos', active: true },
  { id: 'z4', code: 'D', name: 'Zona Expedição', temperature: -5, description: 'Câmara de expedição', active: true },
  { id: 'z5', code: 'Q', name: 'Quarentena', temperature: -10, description: 'Produtos em quarentena/análise', active: true },
]

export const aisles: Aisle[] = [
  { id: 'a1', code: 'B1', name: 'Corredor B1', zoneId: 'z2' },
  { id: 'a2', code: 'B2', name: 'Corredor B2', zoneId: 'z2' },
  { id: 'a3', code: 'B3', name: 'Corredor B3', zoneId: 'z2' },
  { id: 'a4', code: 'C1', name: 'Corredor Picking C1', zoneId: 'z3' },
]

export const shelves: Shelf[] = [
  { id: 's1', code: 'E1', aisleId: 'a1' },
  { id: 's2', code: 'E2', aisleId: 'a1' },
  { id: 's3', code: 'E3', aisleId: 'a2' },
  { id: 's4', code: 'E4', aisleId: 'a2' },
  { id: 's5', code: 'E5', aisleId: 'a3' },
  { id: 's6', code: 'P1', aisleId: 'a4' },
]

export const locations: Location[] = [
  { id: 'l1', code: 'B1-E1-N1-P1', shelfId: 's1', level: 1, position: 1, type: 'RESERVE', capacity: 10, active: true, currentStock: 6, occupancy: 60 },
  { id: 'l2', code: 'B1-E1-N1-P2', shelfId: 's1', level: 1, position: 2, type: 'RESERVE', capacity: 10, active: true, currentStock: 8, occupancy: 80 },
  { id: 'l3', code: 'B1-E1-N2-P1', shelfId: 's1', level: 2, position: 1, type: 'RESERVE', capacity: 10, active: true, currentStock: 2, occupancy: 20 },
  { id: 'l4', code: 'B1-E2-N1-P1', shelfId: 's2', level: 1, position: 1, type: 'RESERVE', capacity: 10, active: true, currentStock: 10, occupancy: 100 },
  { id: 'l5', code: 'B2-E3-N1-P1', shelfId: 's3', level: 1, position: 1, type: 'RESERVE', capacity: 10, active: true, currentStock: 5, occupancy: 50 },
  { id: 'l6', code: 'B3-E5-N1-P1', shelfId: 's5', level: 1, position: 1, type: 'RESERVE', capacity: 10, active: true, currentStock: 0, occupancy: 0 },
  { id: 'l7', code: 'C1-P1-N1-P1', shelfId: 's6', level: 1, position: 1, type: 'PICKING', capacity: 5, active: true, currentStock: 3, occupancy: 60 },
  { id: 'l8', code: 'C1-P1-N1-P2', shelfId: 's6', level: 1, position: 2, type: 'PICKING', capacity: 5, active: true, currentStock: 4, occupancy: 80 },
  { id: 'l9', code: 'A-REC-01', shelfId: 's1', level: 0, position: 1, type: 'RECEIVING', capacity: 20, active: true, currentStock: 0, occupancy: 0 },
  { id: 'l10', code: 'D-EXP-01', shelfId: 's1', level: 0, position: 1, type: 'SHIPPING', capacity: 20, active: true, currentStock: 0, occupancy: 0 },
]

export const suppliers: Supplier[] = [
  { id: 'sup1', code: 'SUP001', name: 'Ocean Trade Asia Lda', country: 'Portugal (importador)', contact: 'Wang Lei', email: 'wang@oceantrade.pt', phone: '+351912345678', active: true },
  { id: 'sup2', code: 'SUP002', name: 'FrozenPro Import Lda', country: 'Portugal', contact: 'Huang Min', email: 'huangmin@frozenpro.pt', phone: '+351934567890', active: true },
  { id: 'sup3', code: 'SUP003', name: 'Asia Pacific Foods', country: 'China', contact: 'Li Wei', email: 'liwei@apf.cn', phone: '+86131234567', active: true },
  { id: 'sup4', code: 'SUP004', name: 'EuroSea Imports', country: 'Espanha', contact: 'Carlos Ruiz', email: 'carlos@eurosea.es', phone: '+34912345678', active: true },
]

export const customers: Customer[] = [
  { id: 'cus1', code: 'CLI001', name: 'Restaurante Jardim da China', nif: '509123456', address: 'Rua Augusta 45, Lisboa', contact: 'Chen Wei', email: 'chen@jardimchina.pt', phone: '+351963456789', active: true },
  { id: 'cus2', code: 'CLI002', name: 'Great Wall Restaurant', nif: '509234567', address: 'Av. da Liberdade 200, Lisboa', contact: 'Liu Yang', email: 'liu@greatwall.pt', phone: '+351964567890', active: true },
  { id: 'cus3', code: 'CLI003', name: 'China Town Market', nif: '509345678', address: 'R. do Benformoso 78, Lisboa', contact: 'Zhang Hong', email: 'zhang@chinatown.pt', phone: '+351965678901', active: true },
  { id: 'cus4', code: 'CLI004', name: 'Asian Food Distribuição', nif: '509456789', address: 'Zona Industrial Alfragide, Amadora', contact: 'Wang Fang', email: 'wfang@asianfood.pt', phone: '+351966789012', active: true },
  { id: 'cus5', code: 'CLI005', name: 'Panda Express Porto', nif: '509567890', address: 'Rua de Santa Catarina 350, Porto', contact: 'Li Ming', email: 'liming@panda.pt', phone: '+351967890123', active: true },
  { id: 'cus6', code: 'CLI006', name: 'Oriental Supermarket', nif: '509678901', address: 'Av. António Augusto de Aguiar 45, Lisboa', contact: 'Zhou Ling', email: 'zhou@oriental.pt', phone: '+351968901234', active: true },
]

const today = new Date()
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().split('T')[0] }

export const stockLots: StockLot[] = [
  {
    id: 'sl1', productId: 'p1', lotNumber: 'L2024-001', supplierId: 'sup1', locationId: 'l1',
    expiryDate: addDays(today, 180), productionDate: addDays(today, -180), quantity: 80, quantityKg: 320,
    reservedQty: 0, status: 'AVAILABLE', createdAt: addDays(today, -180), updatedAt: today.toISOString(), daysUntilExpiry: 180
  },
  {
    id: 'sl2', productId: 'p1', lotNumber: 'L2024-002', supplierId: 'sup1', locationId: 'l2',
    expiryDate: addDays(today, 365), productionDate: addDays(today, -90), quantity: 65, quantityKg: 260,
    reservedQty: 10, status: 'AVAILABLE', createdAt: addDays(today, -90), updatedAt: today.toISOString(), daysUntilExpiry: 365
  },
  {
    id: 'sl3', productId: 'p2', lotNumber: 'L2024-010', supplierId: 'sup2', locationId: 'l3',
    expiryDate: addDays(today, 25), productionDate: addDays(today, -200), quantity: 85, quantityKg: 850,
    reservedQty: 20, status: 'AVAILABLE', createdAt: addDays(today, -200), updatedAt: today.toISOString(), daysUntilExpiry: 25
  },
  {
    id: 'sl4', productId: 'p3', lotNumber: 'L2024-020', supplierId: 'sup3', locationId: 'l4',
    expiryDate: addDays(today, 8), productionDate: addDays(today, -350), quantity: 12, quantityKg: 60,
    reservedQty: 0, status: 'AVAILABLE', createdAt: addDays(today, -350), updatedAt: today.toISOString(), daysUntilExpiry: 8
  },
  {
    id: 'sl5', productId: 'p4', lotNumber: 'L2024-030', supplierId: 'sup1', locationId: 'l5',
    expiryDate: addDays(today, 240), productionDate: addDays(today, -120), quantity: 320, quantityKg: 4800,
    reservedQty: 50, status: 'AVAILABLE', createdAt: addDays(today, -120), updatedAt: today.toISOString(), daysUntilExpiry: 240
  },
  {
    id: 'sl6', productId: 'p6', lotNumber: 'L2024-035', supplierId: 'sup2', locationId: 'l6',
    expiryDate: addDays(today, 15), productionDate: addDays(today, -350), quantity: 8, quantityKg: 80,
    reservedQty: 0, status: 'AVAILABLE', createdAt: addDays(today, -350), updatedAt: today.toISOString(), daysUntilExpiry: 15
  },
  {
    id: 'sl7', productId: 'p9', lotNumber: 'L2024-050', supplierId: 'sup3', locationId: 'l7',
    expiryDate: addDays(today, 90), productionDate: addDays(today, -275), quantity: 380, quantityKg: 304,
    reservedQty: 100, status: 'AVAILABLE', createdAt: addDays(today, -275), updatedAt: today.toISOString(), daysUntilExpiry: 90
  },
  {
    id: 'sl8', productId: 'p14', lotNumber: 'L2024-060', supplierId: 'sup4', locationId: 'l8',
    expiryDate: addDays(today, 3), productionDate: addDays(today, -530), quantity: 5, quantityKg: 25,
    reservedQty: 5, status: 'RESERVED', createdAt: addDays(today, -530), updatedAt: today.toISOString(), daysUntilExpiry: 3
  },
  {
    id: 'sl9', productId: 'p5', lotNumber: 'L2024-040', supplierId: 'sup1', locationId: 'l1',
    expiryDate: addDays(today, 150), productionDate: addDays(today, -210), quantity: 67, quantityKg: 294.8,
    reservedQty: 0, status: 'AVAILABLE', createdAt: addDays(today, -210), updatedAt: today.toISOString(), daysUntilExpiry: 150
  },
  {
    id: 'sl10', productId: 'p12', lotNumber: 'L2024-070', supplierId: 'sup2', locationId: 'l2',
    expiryDate: addDays(today, -5), productionDate: addDays(today, -95), quantity: 55, quantityKg: 330,
    reservedQty: 0, status: 'BLOCKED', createdAt: addDays(today, -95), updatedAt: today.toISOString(), daysUntilExpiry: -5
  },
]

export const receivings: Receiving[] = [
  {
    id: 'rec1', code: 'REC-2024-001', supplierId: 'sup1', documentNumber: 'FT2024/1234',
    expectedDate: addDays(today, -2), receivedDate: addDays(today, -2), status: 'APPROVED',
    hasDivergence: false, notes: 'Chegada sem problemas', createdById: 'u2',
    createdAt: addDays(today, -3), updatedAt: addDays(today, -2)
  },
  {
    id: 'rec2', code: 'REC-2024-002', supplierId: 'sup2', documentNumber: 'FT2024/5678',
    expectedDate: addDays(today, -1), receivedDate: addDays(today, -1), status: 'WITH_DIVERGENCE',
    hasDivergence: true, notes: 'Divergência na quantidade de lula', createdById: 'u3',
    createdAt: addDays(today, -1), updatedAt: addDays(today, -1)
  },
  {
    id: 'rec3', code: 'REC-2024-003', supplierId: 'sup3', documentNumber: 'FT2024/9012',
    expectedDate: today.toISOString().split('T')[0], status: 'IN_PROGRESS',
    hasDivergence: false, createdById: 'u3',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 'rec4', code: 'REC-2024-004', supplierId: 'sup4', documentNumber: 'FT2024/3456',
    expectedDate: addDays(today, 1), status: 'PENDING',
    hasDivergence: false, createdById: 'u2',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
]

export const receivingItems: ReceivingItem[] = [
  { id: 'ri1', receivingId: 'rec1', productId: 'p1', expectedQty: 100, receivedQty: 100, lotNumber: 'L2024-001', expiryDate: addDays(today, 180), quantityKg: 400 },
  { id: 'ri2', receivingId: 'rec1', productId: 'p4', expectedQty: 50, receivedQty: 50, lotNumber: 'L2024-030', expiryDate: addDays(today, 240) },
  { id: 'ri3', receivingId: 'rec2', productId: 'p2', expectedQty: 100, receivedQty: 85, lotNumber: 'L2024-010', expiryDate: addDays(today, 25), quantityKg: 850 },
  { id: 'ri4', receivingId: 'rec3', productId: 'p9', expectedQty: 200, receivedQty: 0, lotNumber: 'L2024-050' },
  { id: 'ri5', receivingId: 'rec4', productId: 'p7', expectedQty: 60, receivedQty: 0 },
]

export const shippingOrders: ShippingOrder[] = [
  {
    id: 'ship1', code: 'EXP-2024-001', customerId: 'cus1', route: 'Lisboa Centro',
    requestedDate: addDays(today, -1), shippedDate: addDays(today, -1), status: 'DISPATCHED',
    notes: 'Entrega urgente', createdAt: addDays(today, -2), updatedAt: addDays(today, -1)
  },
  {
    id: 'ship2', code: 'EXP-2024-002', customerId: 'cus2', route: 'Lisboa Norte',
    requestedDate: today.toISOString().split('T')[0], status: 'IN_PICKING',
    createdAt: addDays(today, -1), updatedAt: today.toISOString()
  },
  {
    id: 'ship3', code: 'EXP-2024-003', customerId: 'cus3', route: 'Lisboa Centro',
    requestedDate: today.toISOString().split('T')[0], status: 'CONFIRMED',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 'ship4', code: 'EXP-2024-004', customerId: 'cus4', route: 'Amadora',
    requestedDate: addDays(today, 1), status: 'PENDING',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 'ship5', code: 'EXP-2024-005', customerId: 'cus5', route: 'Porto',
    requestedDate: addDays(today, 2), status: 'PENDING',
    notes: 'Entrega Porto - verificar temperatura', createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
]

export const shippingItems: ShippingOrderItem[] = [
  { id: 'si1', shippingOrderId: 'ship1', productId: 'p1', requestedQty: 20, pickedQty: 20, shippedQty: 20, unitPrice: 18.5 },
  { id: 'si2', shippingOrderId: 'ship1', productId: 'p9', requestedQty: 30, pickedQty: 30, shippedQty: 30, unitPrice: 12 },
  { id: 'si3', shippingOrderId: 'ship2', productId: 'p1', requestedQty: 15, pickedQty: 8, shippedQty: 0, unitPrice: 18.5 },
  { id: 'si4', shippingOrderId: 'ship2', productId: 'p4', requestedQty: 25, pickedQty: 15, shippedQty: 0, unitPrice: 22 },
  { id: 'si5', shippingOrderId: 'ship3', productId: 'p5', requestedQty: 10, pickedQty: 0, shippedQty: 0, unitPrice: 35 },
  { id: 'si6', shippingOrderId: 'ship3', productId: 'p2', requestedQty: 20, pickedQty: 0, shippedQty: 0, unitPrice: 15 },
  { id: 'si7', shippingOrderId: 'ship4', productId: 'p9', requestedQty: 50, pickedQty: 0, shippedQty: 0, unitPrice: 12 },
  { id: 'si8', shippingOrderId: 'ship4', productId: 'p10', requestedQty: 40, pickedQty: 0, shippedQty: 0, unitPrice: 11 },
]

export const pickingTasks: PickingTask[] = [
  {
    id: 'pt1', code: 'PICK-2024-001', shippingOrderId: 'ship2', assignedToId: 'u3',
    status: 'IN_PROGRESS', priority: 'HIGH', startedAt: today.toISOString(),
    createdAt: addDays(today, -1), updatedAt: today.toISOString()
  },
  {
    id: 'pt2', code: 'PICK-2024-002', shippingOrderId: 'ship3', assignedToId: 'u6',
    status: 'PENDING', priority: 'NORMAL',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 'pt3', code: 'PICK-2024-003', shippingOrderId: 'ship4',
    status: 'PENDING', priority: 'NORMAL',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
]

export const inventories: Inventory[] = [
  {
    id: 'inv1', code: 'INV-2024-001', type: 'CYCLIC', status: 'APPROVED',
    startedAt: addDays(today, -7), completedAt: addDays(today, -6), approvedAt: addDays(today, -5),
    notes: 'Inventário cíclico zona B1',
    createdAt: addDays(today, -7), updatedAt: addDays(today, -5)
  },
  {
    id: 'inv2', code: 'INV-2024-002', type: 'PARTIAL', status: 'IN_PROGRESS',
    startedAt: today.toISOString(), notes: 'Inventário parcial categoria Peixe',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 'inv3', code: 'INV-2024-003', type: 'TOTAL', status: 'DRAFT',
    notes: 'Inventário total mensal - planeado para fim do mês',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
]

export const tasks: Task[] = [
  {
    id: 't1', code: 'TSK-001', type: 'PUTAWAY', status: 'IN_PROGRESS', priority: 'HIGH',
    assignedToId: 'u3', description: 'Armazenar receção REC-2024-003 - Har Gow',
    locationId: 'l3', reference: 'rec3', dueAt: addDays(today, 0),
    startedAt: today.toISOString(), createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 't2', code: 'TSK-002', type: 'PICK', status: 'IN_PROGRESS', priority: 'URGENT',
    assignedToId: 'u3', description: 'Picking EXP-2024-002 - Camarão e Frango',
    reference: 'ship2', dueAt: addDays(today, 0),
    startedAt: today.toISOString(), createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 't3', code: 'TSK-003', type: 'REPLENISH', status: 'PENDING', priority: 'HIGH',
    assignedToId: 'u6', description: 'Repor picking - Polvo Cozido IQF (stock crítico)',
    locationId: 'l7', dueAt: addDays(today, 0),
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 't4', code: 'TSK-004', type: 'RECEIVE', status: 'PENDING', priority: 'NORMAL',
    description: 'Receção prevista SUP004 amanhã - doc FT2024/3456',
    reference: 'rec4', dueAt: addDays(today, 1),
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 't5', code: 'TSK-005', type: 'INVENTORY', status: 'ASSIGNED', priority: 'NORMAL',
    assignedToId: 'u6', description: 'Inventário parcial - Peixe e Marisco zona B2',
    reference: 'inv2', dueAt: addDays(today, 1),
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 't6', code: 'TSK-006', type: 'SHIP', status: 'PENDING', priority: 'HIGH',
    description: 'Expedir EXP-2024-002 Great Wall Restaurant após picking',
    reference: 'ship2', dueAt: addDays(today, 0),
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
]

export const divergences: Divergence[] = [
  {
    id: 'div1', code: 'DIV-2024-001', type: 'RECEIVING_DIFFERENCE', priority: 'HIGH',
    status: 'OPEN', description: 'Receção REC-2024-002: 15 caixas de lula em falta (esperado 100, recebido 85)',
    assignedToId: 'u2', receivingId: 'rec2',
    createdAt: addDays(today, -1), updatedAt: addDays(today, -1)
  },
  {
    id: 'div2', code: 'DIV-2024-002', type: 'EXPIRED_LOT', priority: 'CRITICAL',
    status: 'OPEN', description: 'Lote L2024-070 (Tofu Firme) vencido há 5 dias - bloqueio automático',
    assignedToId: 'u2',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 'div3', code: 'DIV-2024-003', type: 'EXPIRED_LOT', priority: 'HIGH',
    status: 'IN_PROGRESS', description: 'Lote L2024-060 (Vieira Coral) vence em 3 dias - 5 caixas ainda reservadas',
    assignedToId: 'u5',
    correctiveAction: 'Contactar cliente para expedição urgente',
    createdAt: addDays(today, -2), updatedAt: today.toISOString()
  },
  {
    id: 'div4', code: 'DIV-2024-004', type: 'INCOMPLETE_PICKING', priority: 'MEDIUM',
    status: 'OPEN', description: 'Picking PICK-2024-001 incompleto após 4 horas - EXP-2024-002 em risco',
    assignedToId: 'u3', shippingOrderId: 'ship2',
    createdAt: today.toISOString(), updatedAt: today.toISOString()
  },
  {
    id: 'div5', code: 'DIV-2024-005', type: 'NEGATIVE_STOCK', priority: 'HIGH',
    status: 'OPEN', description: 'Stock negativo detetado após expedição: Barriga de Porco IQF -2 caixas',
    createdAt: addDays(today, -3), updatedAt: addDays(today, -3)
  },
]

export const stockMovements: StockMovement[] = [
  { id: 'mv1', type: 'RECEIVING', stockLotId: 'sl1', quantity: 100, quantityKg: 400, reference: 'rec1', userId: 'u3', createdAt: addDays(today, -2) },
  { id: 'mv2', type: 'SHIPPING', stockLotId: 'sl1', quantity: -20, reference: 'ship1', userId: 'u5', createdAt: addDays(today, -1) },
  { id: 'mv3', type: 'RECEIVING', stockLotId: 'sl3', quantity: 85, quantityKg: 850, reference: 'rec2', userId: 'u3', createdAt: addDays(today, -1) },
  { id: 'mv4', type: 'TRANSFER', stockLotId: 'sl7', quantity: -30, fromLocationId: 'l4', toLocationId: 'l7', userId: 'u6', createdAt: addDays(today, -1) },
  { id: 'mv5', type: 'SHIPPING', stockLotId: 'sl7', quantity: -30, reference: 'ship1', userId: 'u5', createdAt: addDays(today, -1) },
  { id: 'mv6', type: 'ADJUSTMENT', stockLotId: 'sl2', quantity: -5, notes: 'Ajuste inventário - diferença contagem', userId: 'u2', createdAt: addDays(today, -7) },
]

// Dashboard computed stats
export const dashboardStats = {
  totalStockValue: stockLots.reduce((acc, s) => acc + s.quantity, 0),
  criticalProducts: products.filter(p => (p.currentStock || 0) <= p.minStock).length,
  expiringProducts: stockLots.filter(s => s.daysUntilExpiry !== undefined && s.daysUntilExpiry <= 30 && s.daysUntilExpiry > 0).length,
  pendingOrders: shippingOrders.filter(s => ['PENDING', 'CONFIRMED', 'IN_PICKING'].includes(s.status)).length,
  activeTasks: tasks.filter(t => ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length,
  openDivergences: divergences.filter(d => ['OPEN', 'IN_PROGRESS'].includes(d.status)).length,
  todayReceivings: receivings.filter(r => r.createdAt?.startsWith(today.toISOString().split('T')[0])).length,
  todayShipments: shippingOrders.filter(s => s.shippedDate?.startsWith(today.toISOString().split('T')[0])).length,
  stockByCategory: [
    { name: 'Peixe/Marisco', value: 347 },
    { name: 'Carne/Aves', value: 395 },
    { name: 'Dim Sum', value: 826 },
    { name: 'Legumes', value: 264 },
    { name: 'Tofu', value: 55 },
    { name: 'Noodles', value: 178 },
    { name: 'Refeições', value: 35 },
  ],
  movementsLast7Days: [
    { day: 'Seg', recepcoes: 3, expedicoes: 5, transferencias: 2 },
    { day: 'Ter', recepcoes: 1, expedicoes: 8, transferencias: 3 },
    { day: 'Qua', recepcoes: 2, expedicoes: 6, transferencias: 1 },
    { day: 'Qui', recepcoes: 4, expedicoes: 4, transferencias: 4 },
    { day: 'Sex', recepcoes: 2, expedicoes: 9, transferencias: 2 },
    { day: 'Sab', recepcoes: 0, expedicoes: 3, transferencias: 0 },
    { day: 'Dom', recepcoes: 1, expedicoes: 2, transferencias: 1 },
  ],
  expiringByDays: [
    { days: '0-7 dias', count: 3, color: '#EF4444' },
    { days: '8-15 dias', count: 2, color: '#F97316' },
    { days: '16-30 dias', count: 4, color: '#F59E0B' },
    { days: '31-60 dias', count: 7, color: '#EAB308' },
    { days: '61-90 dias', count: 5, color: '#84CC16' },
  ],
  operatorProductivity: [
    { name: 'Carlos', picking: 45, recepcao: 12, transferencia: 8 },
    { name: 'Sofia', picking: 38, recepcao: 8, transferencia: 12 },
    { name: 'João', picking: 0, recepcao: 5, transferencia: 3 },
    { name: 'Miguel', picking: 15, recepcao: 0, transferencia: 5 },
  ],
  topProducts: [
    { name: 'Har Gow', rotacao: 380 },
    { name: 'Siu Mai', rotacao: 290 },
    { name: 'Frango IQF', rotacao: 320 },
    { name: 'Camarão Tigre', rotacao: 145 },
    { name: 'Udon Noodles', rotacao: 178 },
  ],
}
