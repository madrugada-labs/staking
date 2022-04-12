import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
const assert = require("assert");
import { JobFactory } from "../target/types/job_factory";
import {v4 as uuidv4} from "uuid";

describe("job-factory", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.JobFactory as Program<JobFactory>;
  const keyPair = anchor.web3.Keypair.generate();


  it("Funds the user", async() => {
    // gotta fund keyPair
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        keyPair.publicKey,
        10000000000
      ),
      "confirmed"
    );

    const userBalance = await provider.connection.getBalance(keyPair.publicKey);
    assert.strictEqual(10000000000, userBalance );

  });
  const jobAdId = uuidv4();

  it("Initializes jobStakingContract", async () => {

    const maxAmountStakedPerApplication = 10000;
    
    const [settingsAccount, b] = await anchor.web3.PublicKey.findProgramAddress(
      // we need to do this because the seed has a max size; seeds are split.
      [Buffer.from("JOB_SETTINGS"), Buffer.from(jobAdId.substring(0, 18)), Buffer.from(jobAdId.substring(18, 36))],
      program.programId
      );
      console.log(settingsAccount);
      console.log(b);

    const tx = await program.rpc.initialize(jobAdId, maxAmountStakedPerApplication, {
      accounts: {
        authority: keyPair.publicKey, 
        settings: settingsAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [keyPair]
    });
    const settingsAccountState = await program.account.jobStakingSettings.fetch(settingsAccount);
    assert.strictEqual(jobAdId, settingsAccountState.jobAdId );
    assert.strictEqual(maxAmountStakedPerApplication, settingsAccountState.maxAmountPerApplication );
    assert.strictEqual(settingsAccountState.authority,  settingsAccountState.authority );

    // check how much it costs
    const userBalance = await provider.connection.getBalance(keyPair.publicKey);
    assert.strictEqual(9998524480, userBalance );
  });

  it("Initializes application staking", async () => {
    const [settingsAccountWitBump, settingsAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("JOB_SETTINGS"), Buffer.from(jobAdId.substring(0, 18)), Buffer.from(jobAdId.substring(18, 36))],
      program.programId
    );
    console.log(settingsAccountWitBump);
    console.log(settingsAccountBump);

    const tx = await program.rpc.initializeApplicationStaking(jobAdId, settingsAccountBump, {
      accounts: {
        authority: keyPair.publicKey, 
        settings: settingsAccountWitBump,
      },
      signers: [keyPair]
    });
    
    // check how much it costs
    const userBalance = await provider.connection.getBalance(keyPair.publicKey);
    assert.strictEqual(9998524480, userBalance );
  });
});
