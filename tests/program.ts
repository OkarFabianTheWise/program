import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TwitterApp } from "../target/types/twitter_app";
import { expect } from "chai";

describe("twitter_app", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  // anchor.setProvider(provider);
  anchor.setProvider(anchor.AnchorProvider.env());

  // Get the program from the workspace
  const program = anchor.workspace.TwitterApp as anchor.Program<TwitterApp>;; // use anchor.Program

  const keybyte = [
    191, 18, 208, 61, 25, 134, 35, 202, 134, 119, 77, 42, 14, 209, 153, 103,
    123, 101, 104, 133, 64, 179, 160, 6, 129, 65, 27, 244, 97, 7, 3, 11, 11,
    29, 79, 133, 48, 106, 105, 227, 193, 200, 140, 49, 66, 63, 18, 41, 37,
    106, 100, 133, 99, 17, 147, 102, 108, 4, 175, 176, 7, 92, 209, 21,
  ];

  const wallet = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(keybyte))
  console.log("wallet:", wallet.publicKey.toString())

  const content = "SUPERTEAM IS AWESOME!"; // Tweet text

  it("Can create a profile", async () => {
    // Create a new wallet
    // const wallet = anchor.web3.Keypair.generate();
    
    // Find the PDA for the profile
    const [profilePda, Bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), wallet.publicKey.toBuffer()],
      program.programId
    );

    // Airdrop some SOL to the wallet
    // await provider.connection.requestAirdrop(wallet.publicKey, anchor.web3.LAMPORTS_PER_SOL);

    // Create profile
    const tx = await program.methods
      .createProfile("SHALLA", Bump)
      .accounts({
        profile: profilePda,
        authority: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([wallet])
      .rpc({commitment: "confirmed"});

    console.log("creating profile!")

    await sleep(3000); // i waited to ensure state is updated onchain

    // Fetch the profile
    const profileAccount = await program.account.profile.fetch(profilePda);
    
    // Verify profile details
    expect(profileAccount.username).to.equal("SHALLA");
    expect(profileAccount.authority.toBase58()).to.equal(wallet.publicKey.toBase58());
  });

  it("Can create a tweet", async () => {
    // Create a new wallet
    // const wallet = anchor.web3.Keypair.generate();

    // Find the PDA for the tweet
    const [tweetPda, Bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("tweet"), 
        wallet.publicKey.toBuffer(), 
        Buffer.from(content)
      ],
      program.programId
    );

    // Airdrop some SOL to the wallet
    // await provider.connection.requestAirdrop(wallet.publicKey, anchor.web3.LAMPORTS_PER_SOL);

    // Create tweet
    const tx = await program.methods
      .createTweet(content)
      .accounts({
        tweet: tweetPda,
        authority: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([wallet])
      .rpc({commitment: "confirmed"});

    console.log("creating tweet!")

    await sleep(3000); // i waited to ensure state is updated onchain

    // Fetch the tweet
    const tweetAccount = await program.account.tweet.fetch(tweetPda);
    
    // Verify tweet details
    expect(tweetAccount.content).to.equal(content);
    expect(tweetAccount.authority.toBase58()).to.equal(wallet.publicKey.toBase58());
    expect(tweetAccount.likes.toNumber()).to.equal(0);
  });

  it("Can like a tweet", async () => {
    // Create a new wallet for tweet creation
    // const wallet = anchor.web3.Keypair.generate();

    // Find the PDA for the tweet
    const [tweetPda, Bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("tweet"), 
        wallet.publicKey.toBuffer(), 
        Buffer.from(content)
      ],
      program.programId
    );

    // Airdrop some SOL to the wallet
    // await provider.connection.requestAirdrop(wallet.publicKey, anchor.web3.LAMPORTS_PER_SOL);

    // Like the tweet
    const tx =await program.methods
      .likeTweet()
      .accounts({
        tweet: tweetPda,
        authority: wallet.publicKey
      })
      .signers([wallet])
      .rpc({commitment: "confirmed"});

      console.log("liking tweet!")

    await sleep(3000);

    // Fetch the tweet
    const tweetAccount = await program.account.tweet.fetch(tweetPda);
    // Verify like count
    expect(tweetAccount.likes.toNumber()).to.equal(1);
  });

});

const sleep = (ms: number): Promise<void> => {
  console.log("confirming transaction")
  return new Promise(resolve => setTimeout(resolve, ms));
};