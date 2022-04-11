use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const JOB_SETTINGS_SEED: &'static [u8] = b"JOB_SETTINGS";
#[program]
pub mod staking {
    use super::*;

    pub fn initialize(
        ctx: Context<InitializeJobStaking>,
        job_ad_id: u32,
        max_amount_per_application: u32,
    ) -> Result<()> {
        // assert!(1 == job_ad_id);
        ctx.accounts.settings.job_ad_id = job_ad_id;
        ctx.accounts.settings.max_amount_per_application = max_amount_per_application;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(job_ad_id: u32)]
pub struct InitializeJobStaking<'info> {
    #[account(init,
    payer = authority,
    seeds = [JOB_SETTINGS_SEED, job_ad_id.to_be_bytes().as_ref()],
    bump,
    space = 8 + 4 + 4)]
    pub settings: Account<'info, Settings>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Settings {
    pub job_ad_id: u32,                  // 4 bytes
    pub max_amount_per_application: u32, // 4 bytes
}

pub struct StakingParameters {
    // sets how much can be staked on an applicant
    pub max_amount_per_application: u32,
    pub authority: Pubkey,
}
