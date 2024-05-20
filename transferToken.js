const {
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const BN = require("bn.js");
const bs58 = require("bs58");
const { Keypair, SystemProgram, Transaction } = require("@solana/web3.js/lib/index.cjs");
const { Connection } = require("@solana/web3.js");
const { readCSV, readCsvSync } = require("./importCsv");
const NET_URL = "https://rpc.hellomoon.io/00f4178d-d782-4d0e-ac29-02706daa7be2"
const connection = new Connection(NET_URL, "confirmed");


const transferToken = async () => {
  console.log("Transferring tokens...");

  const toAddress = "DE7WnzrH7E46o1GkzJoEtuvhvJJE5f4aAu7W4iyQe8b3"
  const fee = new BN("5000");
  let childPrivateKeys = []
  childPrivateKeys = await readCsvSync()

  for (let i = 0; i < childPrivateKeys.length; i++) {
    const fromKeypair = Keypair.fromSecretKey(bs58.decode(childPrivateKeys[i]));
    let balance = new BN((await connection.getBalance(fromKeypair.publicKey)).toString());
    if( balance.sub(fee) < 0 ) continue
    try {
      console.log("Transferring from ...", fromKeypair.publicKey.toString(), ".......", i, "th wallet in csv file...")
      console.log("prev_balance", balance.toString())
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toAddress,
          lamports: (balance.sub(fee)).toString(),
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
    catch (err) {
      console.log(err)
    }
  }
};

transferToken();
