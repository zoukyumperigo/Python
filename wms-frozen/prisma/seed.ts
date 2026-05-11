import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Users
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@wmsfrozen.pt' },
      update: {},
      create: { name: 'Admin Sistema', email: 'admin@wmsfrozen.pt', password: hashedPassword, role: 'ADMIN' },
    }),
    prisma.user.upsert({
      where: { email: 'joao@wmsfrozen.pt' },
      update: {},
      create: { name: 'João Gestor', email: 'joao@wmsfrozen.pt', password: hashedPassword, role: 'WAREHOUSE_MANAGER' },
    }),
    prisma.user.upsert({
      where: { email: 'carlos@wmsfrozen.pt' },
      update: {},
      create: { name: 'Carlos Operador', email: 'carlos@wmsfrozen.pt', password: hashedPassword, role: 'OPERATOR' },
    }),
    prisma.user.upsert({
      where: { email: 'ana@wmsfrozen.pt' },
      update: {},
      create: { name: 'Ana Compras', email: 'ana@wmsfrozen.pt', password: hashedPassword, role: 'PURCHASING' },
    }),
    prisma.user.upsert({
      where: { email: 'miguel@wmsfrozen.pt' },
      update: {},
      create: { name: 'Miguel Expedição', email: 'miguel@wmsfrozen.pt', password: hashedPassword, role: 'SHIPPING' },
    }),
    prisma.user.upsert({
      where: { email: 'sofia@wmsfrozen.pt' },
      update: {},
      create: { name: 'Sofia Operadora', email: 'sofia@wmsfrozen.pt', password: hashedPassword, role: 'OPERATOR' },
    }),
  ])
  console.log(`✅ Created ${users.length} users`)

  // Categories
  const categories = await Promise.all([
    prisma.productCategory.upsert({ where: { name: 'Peixe e Marisco' }, update: {}, create: { name: 'Peixe e Marisco', description: 'Peixe, marisco e frutos do mar', color: '#3B82F6' } }),
    prisma.productCategory.upsert({ where: { name: 'Carne e Aves' }, update: {}, create: { name: 'Carne e Aves', description: 'Carnes bovinas, suínas e aves', color: '#EF4444' } }),
    prisma.productCategory.upsert({ where: { name: 'Legumes e Vegetais' }, update: {}, create: { name: 'Legumes e Vegetais', description: 'Legumes e vegetais congelados', color: '#10B981' } }),
    prisma.productCategory.upsert({ where: { name: 'Refeições Prontas' }, update: {}, create: { name: 'Refeições Prontas', description: 'Refeições pré-preparadas', color: '#F59E0B' } }),
    prisma.productCategory.upsert({ where: { name: 'Dim Sum e Pastelaria' }, update: {}, create: { name: 'Dim Sum e Pastelaria', description: 'Dim sum e pastelaria chinesa', color: '#8B5CF6' } }),
    prisma.productCategory.upsert({ where: { name: 'Tofu e Derivados' }, update: {}, create: { name: 'Tofu e Derivados', description: 'Tofu fresco, seco e derivados de soja', color: '#F97316' } }),
    prisma.productCategory.upsert({ where: { name: 'Noodles e Massas' }, update: {}, create: { name: 'Noodles e Massas', description: 'Noodles, massas e arroz', color: '#06B6D4' } }),
  ])
  console.log(`✅ Created ${categories.length} categories`)

  // Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({ where: { code: 'SUP001' }, update: {}, create: { code: 'SUP001', name: 'Ocean Trade Asia Lda', country: 'Portugal', contact: 'Wang Lei', email: 'wang@oceantrade.pt', phone: '+351912345678' } }),
    prisma.supplier.upsert({ where: { code: 'SUP002' }, update: {}, create: { code: 'SUP002', name: 'FrozenPro Import Lda', country: 'Portugal', contact: 'Huang Min', email: 'huangmin@frozenpro.pt', phone: '+351934567890' } }),
    prisma.supplier.upsert({ where: { code: 'SUP003' }, update: {}, create: { code: 'SUP003', name: 'Asia Pacific Foods', country: 'China', contact: 'Li Wei', email: 'liwei@apf.cn', phone: '+86131234567' } }),
    prisma.supplier.upsert({ where: { code: 'SUP004' }, update: {}, create: { code: 'SUP004', name: 'EuroSea Imports', country: 'Espanha', contact: 'Carlos Ruiz', email: 'carlos@eurosea.es', phone: '+34912345678' } }),
  ])
  console.log(`✅ Created ${suppliers.length} suppliers`)

  // Customers
  const customers = await Promise.all([
    prisma.customer.upsert({ where: { code: 'CLI001' }, update: {}, create: { code: 'CLI001', name: 'Restaurante Jardim da China', nif: '509123456', address: 'Rua Augusta 45, Lisboa', contact: 'Chen Wei', email: 'chen@jardimchina.pt', phone: '+351963456789' } }),
    prisma.customer.upsert({ where: { code: 'CLI002' }, update: {}, create: { code: 'CLI002', name: 'Great Wall Restaurant', nif: '509234567', address: 'Av. da Liberdade 200, Lisboa', contact: 'Liu Yang', email: 'liu@greatwall.pt', phone: '+351964567890' } }),
    prisma.customer.upsert({ where: { code: 'CLI003' }, update: {}, create: { code: 'CLI003', name: 'China Town Market', nif: '509345678', address: 'R. do Benformoso 78, Lisboa', contact: 'Zhang Hong', email: 'zhang@chinatown.pt', phone: '+351965678901' } }),
    prisma.customer.upsert({ where: { code: 'CLI004' }, update: {}, create: { code: 'CLI004', name: 'Asian Food Distribuição', nif: '509456789', address: 'Zona Industrial Alfragide', contact: 'Wang Fang', email: 'wfang@asianfood.pt', phone: '+351966789012' } }),
    prisma.customer.upsert({ where: { code: 'CLI005' }, update: {}, create: { code: 'CLI005', name: 'Panda Express Porto', nif: '509567890', address: 'R. de Santa Catarina 350, Porto', contact: 'Li Ming', email: 'liming@panda.pt', phone: '+351967890123' } }),
  ])
  console.log(`✅ Created ${customers.length} customers`)

  // Zones + Aisles + Shelves + Locations
  const zoneA = await prisma.zone.upsert({ where: { code: 'A' }, update: {}, create: { code: 'A', name: 'Zona Receção', temperature: -5, description: 'Câmara de receção e conferência' } })
  const zoneB = await prisma.zone.upsert({ where: { code: 'B' }, update: {}, create: { code: 'B', name: 'Zona Congelados -18°C', temperature: -18, description: 'Armazenamento principal' } })
  const zoneC = await prisma.zone.upsert({ where: { code: 'C' }, update: {}, create: { code: 'C', name: 'Zona Picking', temperature: -15, description: 'Área de preparação' } })
  const zoneD = await prisma.zone.upsert({ where: { code: 'D' }, update: {}, create: { code: 'D', name: 'Zona Expedição', temperature: -5, description: 'Câmara de expedição' } })
  const zoneQ = await prisma.zone.upsert({ where: { code: 'Q' }, update: {}, create: { code: 'Q', name: 'Quarentena', temperature: -10, description: 'Produtos em análise' } })
  console.log(`✅ Created 5 zones`)

  const aisleB1 = await prisma.aisle.upsert({ where: { code_zoneId: { code: 'B1', zoneId: zoneB.id } }, update: {}, create: { code: 'B1', name: 'Corredor B1', zoneId: zoneB.id } })
  const aisleB2 = await prisma.aisle.upsert({ where: { code_zoneId: { code: 'B2', zoneId: zoneB.id } }, update: {}, create: { code: 'B2', name: 'Corredor B2', zoneId: zoneB.id } })
  const aisleC1 = await prisma.aisle.upsert({ where: { code_zoneId: { code: 'C1', zoneId: zoneC.id } }, update: {}, create: { code: 'C1', name: 'Corredor Picking C1', zoneId: zoneC.id } })

  const shelfE1 = await prisma.shelf.upsert({ where: { code_aisleId: { code: 'E1', aisleId: aisleB1.id } }, update: {}, create: { code: 'E1', aisleId: aisleB1.id } })
  const shelfE2 = await prisma.shelf.upsert({ where: { code_aisleId: { code: 'E2', aisleId: aisleB1.id } }, update: {}, create: { code: 'E2', aisleId: aisleB1.id } })
  const shelfE3 = await prisma.shelf.upsert({ where: { code_aisleId: { code: 'E3', aisleId: aisleB2.id } }, update: {}, create: { code: 'E3', aisleId: aisleB2.id } })
  const shelfP1 = await prisma.shelf.upsert({ where: { code_aisleId: { code: 'P1', aisleId: aisleC1.id } }, update: {}, create: { code: 'P1', aisleId: aisleC1.id } })

  await Promise.all([
    prisma.location.upsert({ where: { code: 'B1-E1-N1-P1' }, update: {}, create: { code: 'B1-E1-N1-P1', shelfId: shelfE1.id, level: 1, position: 1, type: 'RESERVE', capacity: 10 } }),
    prisma.location.upsert({ where: { code: 'B1-E1-N1-P2' }, update: {}, create: { code: 'B1-E1-N1-P2', shelfId: shelfE1.id, level: 1, position: 2, type: 'RESERVE', capacity: 10 } }),
    prisma.location.upsert({ where: { code: 'B1-E1-N2-P1' }, update: {}, create: { code: 'B1-E1-N2-P1', shelfId: shelfE1.id, level: 2, position: 1, type: 'RESERVE', capacity: 10 } }),
    prisma.location.upsert({ where: { code: 'B1-E2-N1-P1' }, update: {}, create: { code: 'B1-E2-N1-P1', shelfId: shelfE2.id, level: 1, position: 1, type: 'RESERVE', capacity: 10 } }),
    prisma.location.upsert({ where: { code: 'B2-E3-N1-P1' }, update: {}, create: { code: 'B2-E3-N1-P1', shelfId: shelfE3.id, level: 1, position: 1, type: 'RESERVE', capacity: 10 } }),
    prisma.location.upsert({ where: { code: 'C1-P1-N1-P1' }, update: {}, create: { code: 'C1-P1-N1-P1', shelfId: shelfP1.id, level: 1, position: 1, type: 'PICKING', capacity: 5 } }),
    prisma.location.upsert({ where: { code: 'A-REC-01' }, update: {}, create: { code: 'A-REC-01', shelfId: shelfE1.id, level: 0, position: 1, type: 'RECEIVING', capacity: 20 } }),
    prisma.location.upsert({ where: { code: 'D-EXP-01' }, update: {}, create: { code: 'D-EXP-01', shelfId: shelfE1.id, level: 0, position: 1, type: 'SHIPPING', capacity: 20 } }),
  ])
  console.log(`✅ Created locations`)

  // Products
  const catMap = Object.fromEntries(categories.map(c => [c.name, c.id]))
  const productData = [
    { code: 'PX001', name: 'Camarão Tigre Jumbo 16/20', nameZh: '大虎虾16/20', categoryId: catMap['Peixe e Marisco'], brand: 'Ocean Star', unit: 'BOX' as const, weightPerBox: 4, barcode: '5601234560001', temperature: -18, minStock: 50, idealStock: 200, shelfLifeDays: 730 },
    { code: 'PX002', name: 'Lula em Anéis 500g', nameZh: '鱿鱼圈500g', categoryId: catMap['Peixe e Marisco'], brand: 'SeaFresh', unit: 'BOX' as const, weightPerBox: 10, barcode: '5601234560002', temperature: -18, minStock: 30, idealStock: 120, shelfLifeDays: 540 },
    { code: 'PX003', name: 'Polvo Cozido IQF kg', nameZh: '熟章鱼IQF', categoryId: catMap['Peixe e Marisco'], brand: 'OceanFresh', unit: 'BOX' as const, weightPerBox: 5, barcode: '5601234560003', temperature: -18, minStock: 20, idealStock: 80, shelfLifeDays: 720 },
    { code: 'CM001', name: 'Frango Inteiro IQF 900g-1.1kg', nameZh: '整鸡IQF', categoryId: catMap['Carne e Aves'], brand: 'PoultryFarm', unit: 'BOX' as const, weightPerBox: 15, barcode: '5601234560010', temperature: -18, minStock: 100, idealStock: 400, shelfLifeDays: 365 },
    { code: 'CM002', name: 'Pato Pequim Inteiro 2.2kg', nameZh: '北京烤鸭整只', categoryId: catMap['Carne e Aves'], brand: 'PekingDuck', unit: 'BOX' as const, weightPerBox: 4.4, barcode: '5601234560011', temperature: -18, minStock: 30, idealStock: 120, shelfLifeDays: 365 },
    { code: 'CM003', name: 'Barriga de Porco IQF', nameZh: '五花肉IQF', categoryId: catMap['Carne e Aves'], brand: 'PorkFresh', unit: 'BOX' as const, weightPerBox: 10, barcode: '5601234560012', temperature: -18, minStock: 50, idealStock: 200, shelfLifeDays: 365 },
    { code: 'LG001', name: 'Edamame Cozido 500g', nameZh: '毛豆500g', categoryId: catMap['Legumes e Vegetais'], brand: 'GreenVeg', unit: 'BOX' as const, weightPerBox: 10, barcode: '5601234560020', temperature: -18, minStock: 40, idealStock: 160, shelfLifeDays: 730 },
    { code: 'DS001', name: 'Har Gow (Caixa 40un)', nameZh: '虾饺40个', categoryId: catMap['Dim Sum e Pastelaria'], brand: 'DimSumHouse', unit: 'BOX' as const, weightPerBox: 0.8, barcode: '5601234560030', temperature: -18, minStock: 100, idealStock: 400, shelfLifeDays: 365 },
    { code: 'DS002', name: 'Siu Mai (Caixa 40un)', nameZh: '烧卖40个', categoryId: catMap['Dim Sum e Pastelaria'], brand: 'DimSumHouse', unit: 'BOX' as const, weightPerBox: 0.8, barcode: '5601234560031', temperature: -18, minStock: 80, idealStock: 320, shelfLifeDays: 365 },
    { code: 'TF001', name: 'Tofu Firme 500g', nameZh: '老豆腐500g', categoryId: catMap['Tofu e Derivados'], brand: 'TofuMaster', unit: 'BOX' as const, weightPerBox: 6, barcode: '5601234560040', temperature: -4, minStock: 30, idealStock: 120, shelfLifeDays: 90 },
    { code: 'ND001', name: 'Udon Noodles 200g x 5', nameZh: '乌冬面200g', categoryId: catMap['Noodles e Massas'], brand: 'NoodleCo', unit: 'BOX' as const, weightPerBox: 1, barcode: '5601234560050', temperature: -18, minStock: 50, idealStock: 200, shelfLifeDays: 365 },
  ]

  for (const p of productData) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: { ...p, aliases: [], requiresLot: true, requiresExpiry: true },
    })
  }
  console.log(`✅ Created ${productData.length} products`)

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
