export interface Attestation {
  id: string
  sasId: string
  schemaId: string
  issuerId: string
  holderAddress: string
  data: Record<string, any>
  signature: string
  isActive: boolean
  createdAt: Date
}

export interface CreateAttestationInput {
  sasId: string
  schemaId: string
  issuerId: string
  holderAddress: string
  data: Record<string, any>
  signature: string
}

export interface UpdateAttestationInput {
  data?: Record<string, any>
  signature?: string
  isActive?: boolean
}

export interface IAttestationRepository {
  create(attestationData: CreateAttestationInput): Promise<Attestation>
  findById(id: string): Promise<Attestation | null>
  findBySasId(sasId: string): Promise<Attestation | null>
  findByHolderAddress(holderAddress: string, limit?: number, offset?: number): Promise<Attestation[]>
  findByIssuerId(issuerId: string, limit?: number, offset?: number): Promise<Attestation[]>
  findBySchemaId(schemaId: string, limit?: number, offset?: number): Promise<Attestation[]>
  update(id: string, data: UpdateAttestationInput): Promise<Attestation>
  deactivate(id: string): Promise<Attestation>
  findActive(limit?: number, offset?: number): Promise<Attestation[]>
  countByHolderAddress(holderAddress: string): Promise<number>
  findAll(limit?: number, offset?: number): Promise<Attestation[]>
}