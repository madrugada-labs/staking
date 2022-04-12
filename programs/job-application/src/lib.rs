use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod job_application {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, staking_parameters: JobApplicationStakingParameters) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = signer,
        seeds = [],
        space = 8 + 0,
    bump)]
    pub settings: Account<'info, JobApplicationSettings>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,

}

#[account]
pub struct JobApplicationStakingParameters {
    // sets how much can be staked on an applicant
    pub max_amount_per_application: u32, // 4 bytes
    // defines the authority of downstream programs
    pub authority: Pubkey, // 32 bytes
}

#[account]
pub struct JobApplicationSettings {
    // sets how much can be staked on an applicant
    pub max_amount_per_application: u32, // 4 bytes
    // defines the authority of downstream programs
    pub authority: Pubkey, // 32 bytes
}
