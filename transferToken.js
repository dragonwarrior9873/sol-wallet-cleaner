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

  const toAddress = "vicM6KDMdqFg4GdRcDm2qrwi5npp3Zn1cWnJabQMQWE"
  const fee = new BN("5000");
  let childPrivateKeys = []
  childPrivateKeys = await readCsvSync()
  console.log(childPrivateKeys)

  for (let i = 0; i < childPrivateKeys.length; i++) {
    try {
      const fromKeypair = Keypair.fromSecretKey(bs58.decode(childPrivateKeys[i]));
      if (fromKeypair.publicKey == toAddress) continue
      let prev_balance = new BN((await connection.getBalance(fromKeypair.publicKey)).toString());
      if (prev_balance.sub(fee) < 0) {
        console.log("Transferring from ...", fromKeypair.publicKey.toString(), ".......", i, "th wallet in csv file...")
        console.log("Amount is not enough to transfer.....")
        continue
      }
      console.log("Transferring from ...", fromKeypair.publicKey.toString(), ".......", childPrivateKeys[i], "...........", i, "th wallet in csv file...")
      console.log("prev_balance", prev_balance.toString())
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toAddress,
          lamports: (prev_balance.sub(fee)).toString(),
        }),
      );

      let after_balance = prev_balance
      let count = 0, signature
      while (prev_balance == after_balance) {
        if (count == 3) break;
        signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [fromKeypair],
        );
        after_balance = new BN((await connection.getBalance(fromKeypair.publicKey)).toString());
        console.log("Retry send Transaction ", count, "th times....")
        count++
      }
      if (count == 3) {
        console.log("Transfer failed...", signature);
        console.log("after_balance", after_balance.toString())
      }
      else {
        console.log("Transfer succeed...", signature);
        console.log("after_balance", after_balance.toString())
      }
    }
    catch (err) {
      console.log(err)
    }
  }
};

transferToken();
