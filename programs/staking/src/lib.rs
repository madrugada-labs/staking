use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const JOB_SETTINGS_SEED: &'static [u8] = b"JOB_SETTINGS";
#[program]
pub mod staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, job_ad_id: u32) -> Result<()> {
        // assert!(1 == job_ad_id);
        ctx.accounts.settings.job_ad_id = job_ad_id;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(job_ad_id: u32)]
pub struct Initialize<'info> {
    #[account(init,
    payer = authority,
    seeds = [JOB_SETTINGS_SEED, job_ad_id.to_be_bytes().as_ref()],
    bump,
    space = 8 + 4)]
    pub settings: Account<'info, Settings>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Settings {
    pub job_ad_id: u32,
}
