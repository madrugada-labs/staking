import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
const assert = require("assert");
import { Staking } from "../target/types/staking";

describe("staking", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Staking as Program<Staking>;
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

  it("Is initialized!", async () => {
    const jobAdId = 123;
    let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    let view = new DataView(arr);
    view.setUint32(0, jobAdId, false); // byteOffset = 0; litteEndian = false

    const [settingsAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("JOB_SETTINGS"), Buffer.from(arr)],
      program.programId
    );

    const tx = await program.rpc.initialize(jobAdId, {
      accounts: {
        authority: keyPair.publicKey, 
        systemProgram: anchor.web3.SystemProgram.programId,
        settings: settingsAccount,
      },
      signers: [keyPair]
    });
    const settingsAccountState = await program.account.settings.fetch(settingsAccount);
    assert.strictEqual(jobAdId, settingsAccountState.jobAdId );
  });
});
