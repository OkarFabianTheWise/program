use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("4ckfJfZN2TEQ83HCNzDUbaSN6pKFUtJj9wNfzdEAAk8T");

#[program]
mod twitter_app {
    use super::*;

    pub fn create_profile(ctx: Context<CreateProfile>, username: String, bump: u8) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        profile.authority = *ctx.accounts.authority.key;
        profile.username = username;
        profile.bump = bump;
        Ok(())
    }

    pub fn create_tweet(ctx: Context<CreateTweet>, content: String) -> Result<()> {
        let tweet = &mut ctx.accounts.tweet;
        tweet.authority = *ctx.accounts.authority.key;
        tweet.content = content;
        tweet.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn like_tweet(ctx: Context<LikeTweet>) -> Result<()> {
        let tweet = &mut ctx.accounts.tweet;
        tweet.likes += 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct CreateProfile<'info> {
    #[account(
        init,
        seeds = [b"profile", authority.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + Profile::INIT_SPACE
    )]
    pub profile: Account<'info, Profile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(content: String)]
pub struct CreateTweet<'info> {
    #[account(
        init,
        seeds = [b"tweet", authority.key().as_ref(), content.as_bytes()],
        bump,
        payer = authority,
        space = 8 + Tweet::INIT_SPACE,
    )]
    pub tweet: Account<'info, Tweet>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LikeTweet<'info> {
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(InitSpace)]
#[account]
pub struct Profile {
    pub authority: Pubkey,

    #[max_len(20)]
    pub username: String,
    pub bump: u8,
}

#[derive(InitSpace)]
#[account]
pub struct Tweet {
    pub authority: Pubkey,
    #[max_len(200)]
    pub content: String,
    pub timestamp: i64,
    pub likes: u64,
}
