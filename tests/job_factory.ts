import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
const assert = require("assert");
import { JobFactory } from "../target/types/job_factory";

describe("staking", () => {
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

  it("Initializes jobStakingContract", async () => {
    const jobAdId = 123;
    const maxAmountStakedPerApplication = 10000;
    let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    let view = new DataView(arr);
    view.setUint32(0, jobAdId, false); // byteOffset = 0; litteEndian = false
    
    const [settingsAccount, b] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("JOB_SETTINGS"), Buffer.from(arr)],
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
    assert.strictEqual(9998775040, userBalance );
  });

  it("Initializes application staking", async () => {
    const jobAdId = 123;
    let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    let view = new DataView(arr);
    view.setUint32(0, jobAdId, false); // byteOffset = 0; litteEndian = false

    const [settingsAccountWitBump, settingsAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("JOB_SETTINGS"), Buffer.from(arr)],
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
    assert.strictEqual(9998775040, userBalance );
  });
});
