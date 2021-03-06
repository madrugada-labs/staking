use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const JOB_SETTINGS_SEED: &'static [u8] = b"JOB_SETTINGS";
#[program]
pub mod job_factory {
    use super::*;

    pub fn initialize(
        ctx: Context<InitializeJobStaking>,
        job_ad_id: String,
        max_amount_per_application: u32,
    ) -> Result<()> {
        // populate settings parameters
        ctx.accounts.settings.authority = ctx.accounts.authority.key();
        ctx.accounts.settings.job_ad_id = job_ad_id;
        ctx.accounts.settings.max_amount_per_application = max_amount_per_application;
        Ok(())
    }

    pub fn initialize_application_staking(
        ctx: Context<InitializeApplicationStaking>,
        _job_ad_id: String,
        _job_settings_bump: u8,
    ) -> Result<()> {
        let settings = &ctx.accounts.settings;
        let _staking_parameters = StakingParameters {
            max_amount_per_application: settings.max_amount_per_application,
            authority: settings.authority,
        };
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(job_ad_id: String)]
pub struct InitializeJobStaking<'info> {
    #[account(init,
    payer = authority,
    seeds = [JOB_SETTINGS_SEED, job_ad_id.as_bytes()[..18].as_ref(), job_ad_id.as_bytes()[18..].as_ref()],
    bump,
    space = 8 + 32 + 40 + 4)]
    pub settings: Account<'info, JobStakingSettings>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(job_ad_id: String, job_settings_bump: u8)]
pub struct InitializeApplicationStaking<'info> {
    #[account(
    seeds = [JOB_SETTINGS_SEED, job_ad_id.as_bytes()[..18].as_ref(), job_ad_id.as_bytes()[18..].as_ref()],
    bump = job_settings_bump
    )]
    pub settings: Account<'info, JobStakingSettings>,

    // ensures that the signer of this transaction is the same that created the job
    // contract
    #[account(constraint = authority.key() == settings.authority)]
    pub authority: Signer<'info>,
}

#[account]
pub struct JobStakingSettings {
    pub authority: Pubkey,               // 32 bytes
    pub job_ad_id: String,               // 40 bytes
    pub max_amount_per_application: u32, // 4 bytes
}

pub struct StakingParameters {
    // sets how much can be staked on an applicant
    pub max_amount_per_application: u32,
    // defines the authority of downstream programs
    pub authority: Pubkey,
}
