export function sanitizeUserForClient(user: any) {
  if (!user) return null

  // Support multiple shapes: Prisma user, external provider user, or partial objects
  const email = typeof user.email === 'string' ? user.email : (user.email?.address || '')
  const walletAddress = user.walletAddress || user.wallet?.address || null

  return {
    id: user.id,
    email,
    firstName: user.firstName || user.givenName || '',
    lastName: user.lastName || user.familyName || '',
    displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
    walletAddress,
    role: user.role || 'CITIZEN',
    status: user.status || null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  }
}

export default sanitizeUserForClient
