'use client'

import Badge from '@/components/ui/Badge'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'

const statusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  // ReceivingStatus
  PENDING: { label: 'Pendente', variant: 'neutral' },
  IN_PROGRESS: { label: 'Em Curso', variant: 'info' },
  COMPLETED: { label: 'Concluído', variant: 'success' },
  APPROVED: { label: 'Aprovado', variant: 'success' },
  WITH_DIVERGENCE: { label: 'C/ Divergência', variant: 'warning' },
  CANCELLED: { label: 'Cancelado', variant: 'neutral' },

  // ShippingOrderStatus
  CONFIRMED: { label: 'Confirmado', variant: 'info' },
  IN_PICKING: { label: 'Em Picking', variant: 'purple' },
  PICKED: { label: 'Picked', variant: 'success' },
  DISPATCHED: { label: 'Expedido', variant: 'success' },

  // TaskStatus
  ASSIGNED: { label: 'Atribuído', variant: 'info' },
  BLOCKED: { label: 'Bloqueado', variant: 'danger' },

  // DivergenceStatus
  OPEN: { label: 'Aberta', variant: 'danger' },
  RESOLVED: { label: 'Resolvida', variant: 'success' },
  CLOSED: { label: 'Fechada', variant: 'neutral' },

  // StockStatus
  AVAILABLE: { label: 'Disponível', variant: 'success' },
  RESERVED: { label: 'Reservado', variant: 'info' },
  DAMAGED: { label: 'Danificado', variant: 'danger' },
  RETURNED: { label: 'Devolvido', variant: 'warning' },
  IN_REVIEW: { label: 'Em Revisão', variant: 'warning' },
  QUARANTINE: { label: 'Quarentena', variant: 'warning' },
  EXPIRED: { label: 'Vencido', variant: 'danger' },
}

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusMap[status] ?? { label: status, variant: 'neutral' as BadgeVariant }
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}
