import type { NextRequest } from 'next/server'

interface LoginBody {
  email: string
  password: string
}

const MOCK_USERS = [
  { id: 'u1', name: 'Admin Sistema', email: 'admin@wmsfrozen.pt', role: 'ADMIN' },
  { id: 'u2', name: 'João Gestor', email: 'joao@wmsfrozen.pt', role: 'WAREHOUSE_MANAGER' },
  { id: 'u3', name: 'Carlos Operador', email: 'carlos@wmsfrozen.pt', role: 'OPERATOR' },
  { id: 'u4', name: 'Ana Compras', email: 'ana@wmsfrozen.pt', role: 'PURCHASING' },
  { id: 'u5', name: 'Miguel Expedição', email: 'miguel@wmsfrozen.pt', role: 'SHIPPING' },
  { id: 'u6', name: 'Sofia Operadora', email: 'sofia@wmsfrozen.pt', role: 'OPERATOR' },
]

const MOCK_PASSWORD = 'admin123'

export async function POST(request: NextRequest) {
  let body: Partial<LoginBody>

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const { email, password } = body

  if (!email || !password) {
    return Response.json({ error: 'Email e palavra-passe são obrigatórios.' }, { status: 400 })
  }

  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())

  if (!user || password !== MOCK_PASSWORD) {
    return Response.json({ error: 'Credenciais inválidas.' }, { status: 401 })
  }

  // In production this would be a signed JWT. For the mock we return a stable token.
  const token = `mock-jwt-${user.id}-${Date.now()}`

  return Response.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}
