const {
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const BN = require("bn.js");
const bs58 = require("bs58");
const { Keypair, SystemProgram, Transaction } = require("@solana/web3.js/lib/index.cjs");
const { Connection } = require("@solana/web3.js");
const NET_URL = "https://rpc.hellomoon.io/00f4178d-d782-4d0e-ac29-02706daa7be2"
const connection = new Connection(NET_URL, "confirmed");

const transferToken = async () => {
  console.log("Transferring tokens...".blue);

  const toAddress = "DE7WnzrH7E46o1GkzJoEtuvhvJJE5f4aAu7W4iyQe8b3"
  const fee = new BN("5000");
  const childPrivateKeys = []
  childPrivateKeys.push("31XPspiAcUBB2emYW2h1AEVTAa21mVZ867Baiv1nvHmXSdkxStWAj9svf8v4mDiySgphiu4WoGTR6qZ66MJZTwWR")

  for (let i = 0; i < childPrivateKeys.length; i++) {
    const fromKeypair = Keypair.fromSecretKey(bs58.decode(childPrivateKeys[i]));
    let balance = new BN((await connection.getBalance(fromKeypair.publicKey)).toString());
    console.log("prev_balance", balance.toString())
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toAddress,
        lamports: (balance.sub(fee)).toString(),
        // lamports: 1000
      }),
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [fromKeypair],
    );
    console.log("Transfer done...", signature);
    balance = new BN((await connection.getBalance(fromKeypair.publicKey)).toString());
    console.log("after_balance", balance.toString())
  }
};

transferToken();
