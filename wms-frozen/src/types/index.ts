export type UserRole = 'ADMIN' | 'WAREHOUSE_MANAGER' | 'OPERATOR' | 'PURCHASING' | 'COMMERCIAL' | 'SHIPPING'
export type StockStatus = 'AVAILABLE' | 'RESERVED' | 'BLOCKED' | 'DAMAGED' | 'RETURNED' | 'IN_REVIEW' | 'QUARANTINE' | 'EXPIRED'
export type MovementType = 'RECEIVING' | 'SHIPPING' | 'TRANSFER' | 'ADJUSTMENT' | 'INVENTORY' | 'RETURN' | 'WASTE' | 'QUARANTINE'
export type LocationType = 'PICKING' | 'RESERVE' | 'RECEIVING' | 'SHIPPING' | 'QUARANTINE' | 'STAGING'
export type ReceivingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'WITH_DIVERGENCE' | 'CANCELLED'
export type ShippingOrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PICKING' | 'PICKED' | 'DISPATCHED' | 'CANCELLED'
export type TaskType = 'RECEIVE' | 'INSPECT' | 'PUTAWAY' | 'REPLENISH' | 'PICK' | 'TRANSFER' | 'INVENTORY' | 'SHIP'
export type TaskStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED'
export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
export type DivergenceType = 'RECEIVING_DIFFERENCE' | 'INCOMPLETE_PICKING' | 'NEGATIVE_STOCK' | 'NO_LOCATION' | 'EXPIRED_LOT' | 'BLOCKED_PRODUCT' | 'STALLED_ORDER' | 'PENDING_TASK' | 'OPERATOR_ERROR' | 'TEMPERATURE_BREACH'
export type DivergenceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type DivergencePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type InventoryStatus = 'DRAFT' | 'IN_PROGRESS' | 'COUNTING' | 'REVIEW' | 'APPROVED' | 'CLOSED'
export type InventoryType = 'TOTAL' | 'PARTIAL' | 'BY_PRODUCT' | 'BY_LOCATION' | 'BY_CATEGORY' | 'BY_LOT' | 'CYCLIC'
export type Unit = 'BOX' | 'KG' | 'UNIT' | 'PALLET'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  active: boolean
  createdAt: string
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
  color?: string
  active: boolean
}

export interface Product {
  id: string
  code: string
  name: string
  nameZh?: string
  categoryId: string
  category?: ProductCategory
  brand?: string
  unit: Unit
  weightPerBox?: number
  barcode?: string
  temperature?: number
  minStock: number
  idealStock: number
  active: boolean
  requiresLot: boolean
  requiresExpiry: boolean
  shelfLifeDays?: number
  aliases: string[]
  imageUrl?: string
  notes?: string
  currentStock?: number
  createdAt: string
  updatedAt?: string
}

export interface Zone {
  id: string
  code: string
  name: string
  temperature?: number
  description?: string
  active: boolean
  aisles?: Aisle[]
}

export interface Aisle {
  id: string
  code: string
  name: string
  zoneId: string
  zone?: Zone
  shelves?: Shelf[]
}

export interface Shelf {
  id: string
  code: string
  aisleId: string
  aisle?: Aisle
  locations?: Location[]
}

export interface Location {
  id: string
  code: string
  shelfId: string
  shelf?: Shelf
  level: number
  position: number
  type: LocationType
  capacity?: number
  active: boolean
  currentStock?: number
  occupancy?: number
}

export interface Supplier {
  id: string
  code: string
  name: string
  country?: string
  contact?: string
  email?: string
  phone?: string
  active: boolean
}

export interface Customer {
  id: string
  code: string
  name: string
  nif?: string
  address?: string
  contact?: string
  email?: string
  phone?: string
  active: boolean
  notes?: string
}

export interface StockLot {
  id: string
  productId: string
  product?: Product
  lotNumber: string
  supplierId?: string
  supplier?: Supplier
  locationId?: string
  location?: Location
  expiryDate?: string
  productionDate?: string
  quantity: number
  quantityKg?: number
  reservedQty: number
  status: StockStatus
  notes?: string
  createdAt: string
  updatedAt: string
  daysUntilExpiry?: number
}

export interface StockMovement {
  id: string
  type: MovementType
  stockLotId?: string
  stockLot?: StockLot
  quantity: number
  quantityKg?: number
  fromLocationId?: string
  toLocationId?: string
  reference?: string
  userId?: string
  user?: User
  notes?: string
  createdAt: string
}

export interface Receiving {
  id: string
  code: string
  supplierId: string
  supplier?: Supplier
  documentNumber?: string
  expectedDate?: string
  receivedDate?: string
  status: ReceivingStatus
  hasDivergence: boolean
  notes?: string
  createdById?: string
  createdBy?: User
  items?: ReceivingItem[]
  createdAt: string
  updatedAt: string
}

export interface ReceivingItem {
  id: string
  receivingId: string
  productId: string
  product?: Product
  expectedQty: number
  receivedQty: number
  lotNumber?: string
  expiryDate?: string
  productionDate?: string
  quantityKg?: number
  unitCost?: number
  notes?: string
}

export interface ShippingOrder {
  id: string
  code: string
  customerId: string
  customer?: Customer
  route?: string
  requestedDate?: string
  shippedDate?: string
  status: ShippingOrderStatus
  notes?: string
  items?: ShippingOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface ShippingOrderItem {
  id: string
  shippingOrderId: string
  productId: string
  product?: Product
  stockLotId?: string
  stockLot?: StockLot
  requestedQty: number
  pickedQty: number
  shippedQty: number
  unitPrice?: number
  notes?: string
}

export interface PickingTask {
  id: string
  code: string
  shippingOrderId?: string
  shippingOrder?: ShippingOrder
  assignedToId?: string
  assignedTo?: User
  status: TaskStatus
  priority: TaskPriority
  startedAt?: string
  completedAt?: string
  notes?: string
  items?: PickingTaskItem[]
  createdAt: string
  updatedAt: string
}

export interface PickingTaskItem {
  id: string
  pickingTaskId: string
  productId: string
  product?: Product
  stockLotId?: string
  stockLot?: StockLot
  locationCode?: string
  requestedQty: number
  pickedQty: number
  confirmed: boolean
  notes?: string
}

export interface Inventory {
  id: string
  code: string
  type: InventoryType
  status: InventoryStatus
  startedAt?: string
  completedAt?: string
  approvedAt?: string
  notes?: string
  items?: InventoryItem[]
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  inventoryId: string
  productId: string
  product?: Product
  systemQty: number
  countedQty?: number
  difference?: number
  notes?: string
}

export interface Task {
  id: string
  code: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  assignedToId?: string
  assignedTo?: User
  locationId?: string
  location?: Location
  reference?: string
  description?: string
  dueAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Divergence {
  id: string
  code: string
  type: DivergenceType
  priority: DivergencePriority
  status: DivergenceStatus
  description: string
  assignedToId?: string
  assignedTo?: User
  receivingId?: string
  receiving?: Receiving
  shippingOrderId?: string
  shippingOrder?: ShippingOrder
  inventoryId?: string
  correctiveAction?: string
  resolvedAt?: string
  comments?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  userId: string
  user?: User
  receivingId?: string
  shippingOrderId?: string
  divergenceId?: string
  taskId?: string
  attachments: string[]
  createdAt: string
}

export interface DashboardStats {
  totalStock: number
  criticalProducts: number
  expiringProducts: number
  pendingOrders: number
  activeTasks: number
  openDivergences: number
  todayReceivings: number
  todayShipments: number
  stockByCategory: { name: string; value: number }[]
  movementsToday: { type: string; count: number }[]
  expiringByDays: { days: string; count: number }[]
  topProducts: { name: string; quantity: number }[]
  operatorProductivity: { name: string; tasks: number }[]
}
