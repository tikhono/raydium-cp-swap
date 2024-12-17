use crate::curve::FEE_RATE_DENOMINATOR_VALUE;
use crate::states::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateUserDiscount<'info> {
    // #[account(
    //     address = crate::admin::id()
    // )]
    //relaxed constraint for testing purposes
    pub authority: Signer<'info>,

    /// CHECK: used this account only for specifying user to be updated
    pub user: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"user_discount", user.key().as_ref()],
        bump
    )]
    pub user_discount: Account<'info, UserDiscount>,
}

pub fn update_user_discount(ctx: Context<UpdateUserDiscount>, discount: u64) -> Result<()> {
    require_gte!(30 * FEE_RATE_DENOMINATOR_VALUE / 100, discount); // Discount could not exceed 30%
    ctx.accounts.user_discount.discount_nominator = discount;

    Ok(())
}
