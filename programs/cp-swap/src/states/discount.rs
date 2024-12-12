use anchor_lang::prelude::*;

#[account]
pub struct UserDiscount {
    pub discount_nominator: u64,
    bump: u8,
}
