/**
 * STEP 2: BLOCKCHAIN PERMISSIONS SMART CONTRACT
 * 
 * Allows citizens to:
 * 1. Share documents with verifiers (trustless)
 * 2. Revoke access anytime (no admin needed)
 * 3. All on-chain (transparent)
 * 
 * Citizens don't write contract, don't pay fees
 * Government handles deployment and updates
 */

use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

declare_id!("11111111111111111111111111111111"); // TODO: Replace with actual program ID

#[program]
pub mod document_permissions {
    use super::*;

    /**
     * Initialize permission for a document
     * Called by government on document approval
     * Citizen wallet is the authority (owns the document)
     */
    pub fn grant_access(
        ctx: Context<GrantAccess>,
        document_id: String,
        verifier_wallet: Pubkey,
        access_level: AccessLevel,
        expires_at: Option<i64>,
    ) -> Result<()> {
        let permission = &mut ctx.accounts.permission;
        
        permission.document_id = document_id;
        permission.citizen_wallet = ctx.accounts.citizen_wallet.key();
        permission.verifier_wallet = verifier_wallet;
        permission.access_level = access_level;
        permission.granted_at = Clock::get()?.unix_timestamp;
        permission.expires_at = expires_at;
        permission.is_active = true;

        emit!(PermissionGranted {
            document_id: permission.document_id.clone(),
            citizen: permission.citizen_wallet,
            verifier: verifier_wallet,
            access_level: access_level.clone(),
        });

        Ok(())
    }

    /**
     * Revoke access - citizen clicks "Revoke" and it happens instantly
     * No government approval needed
     * Trustless - can't be undone by anyone except citizen
     */
    pub fn revoke_access(
        ctx: Context<RevokeAccess>,
    ) -> Result<()> {
        let permission = &mut ctx.accounts.permission;
        require!(permission.citizen_wallet == ctx.accounts.citizen_wallet.key(), UnauthorizedRevoke);
        
        permission.is_active = false;
        permission.revoked_at = Some(Clock::get()?.unix_timestamp);

        emit!(PermissionRevoked {
            document_id: permission.document_id.clone(),
            citizen: permission.citizen_wallet,
            verifier: permission.verifier_wallet,
        });

        Ok(())
    }

    /**
     * Check if verifier has access to document
     * Called by verifiers (trustless verification)
     */
    pub fn check_access(
        ctx: Context<CheckAccess>,
    ) -> Result<bool> {
        let permission = &ctx.accounts.permission;
        
        // Check if active
        require!(permission.is_active, PermissionRevoked);
        
        // Check if not expired
        if let Some(expires_at) = permission.expires_at {
            let now = Clock::get()?.unix_timestamp;
            require!(now < expires_at, PermissionExpired);
        }
        
        // Check if verifier matches
        require!(permission.verifier_wallet == ctx.accounts.verifier_wallet.key(), UnauthorizedAccess);
        
        Ok(true)
    }
}

#[derive(Accounts)]
#[instruction(document_id: String)]
pub struct GrantAccess<'info> {
    #[account(init, payer = government_payer, space = 8 + Permission::SPACE)]
    pub permission: Account<'info, Permission>,
    
    pub citizen_wallet: Signer<'info>,
    
    #[account(mut)]
    pub government_payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    #[account(mut)]
    pub permission: Account<'info, Permission>,
    
    pub citizen_wallet: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckAccess<'info> {
    pub permission: Account<'info, Permission>,
    pub verifier_wallet: Signer<'info>,
}

#[account]
pub struct Permission {
    pub document_id: String,
    pub citizen_wallet: Pubkey,
    pub verifier_wallet: Pubkey,
    pub access_level: AccessLevel,
    pub granted_at: i64,
    pub revoked_at: Option<i64>,
    pub expires_at: Option<i64>,
    pub is_active: bool,
}

impl Permission {
    const SPACE: usize = 8 + // document_id (String)
                         32 + // citizen_wallet (Pubkey)
                         32 + // verifier_wallet (Pubkey)
                         1 + // access_level (enum)
                         8 + // granted_at (i64)
                         9 + // revoked_at (Option<i64>)
                         9 + // expires_at (Option<i64>)
                         1;  // is_active (bool)
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum AccessLevel {
    ViewMetadata,
    ViewDocument,
    Verify,
    FullAccess,
}

#[event]
pub struct PermissionGranted {
    pub document_id: String,
    pub citizen: Pubkey,
    pub verifier: Pubkey,
    pub access_level: AccessLevel,
}

#[event]
pub struct PermissionRevoked {
    pub document_id: String,
    pub citizen: Pubkey,
    pub verifier: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Only citizen can revoke access")]
    UnauthorizedRevoke,
    
    #[msg("Only authorized verifier can access")]
    UnauthorizedAccess,
    
    #[msg("Permission has been revoked")]
    PermissionRevoked,
    
    #[msg("Permission has expired")]
    PermissionExpired,
}
