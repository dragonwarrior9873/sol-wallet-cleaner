const {
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const BN = require("bn.js");
const bs58 = require("bs58");
const { Keypair, SystemProgram, Transaction } = require("@solana/web3.js/lib/index.cjs");
const { Connection } = require("@solana/web3.js");
const { readCSV, readCsvSync } = require("./importCsv");
const NET_URL = "https://mainnet.helius-rpc.com/?api-key=e4226aa3-24f7-43c1-869f-a1b1e3fbb148"
const connection = new Connection(NET_URL, "confirmed");


const transferToken = async () => {
  console.log("Transferring tokens...");

  const toAddress = "5nRGRBB66VysyMvTcvPTHtJmYSUZf7zsDRjU6kD7NVjt"
  const fee = new BN("5000");
  let childPrivateKeys = []
  childPrivateKeys = await readCsvSync()

  for (let i = 0; i < childPrivateKeys.length; i++) {
    const fromKeypair = Keypair.fromSecretKey(bs58.decode(childPrivateKeys[i]));
    if ( fromKeypair.publicKey == toAddress) continue
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
