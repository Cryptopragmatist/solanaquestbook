const {
    Connection,
  } = require('@solana/web3.js'); // Import the appropriate module from web3.js


async function establishConnection() {

    const rpcUrl = 'http://api.devnet.solana.com'; //rpcUrl is the address at which your solana blockchain is running, constant variable
  
    connection = new Connection(rpcUrl, 'confirmed');
  
    const version = await connection.getVersion(); // get the connection version after it has succesfully establish
  
    console.log('Connection to cluster established:', rpcUrl, version); //printout the rpcURL and version to prompt cli that is has been established
  
}
async function createKeypairFromFile() {
  const secretKeyString = await fs.readFile("~/.config/solana/id.json", {encoding: 'utf8'});
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}
async function createAccount() {

  const rpcUrl = 'http://localhost:8899';
  connection = new Connection(rpcUrl, 'confirmed');
  const signer = await createKeypairFromFile();
  const newAccountPubkey = await PublicKey.createWithSeed(
    signer.publicKey,
    "campaign1",
    new PublicKey("<ENTER PROGRAM ID HERE>"),
  );
  const lamports = await connection.getMinimumBalanceForRentExemption(
    1024,
  );
  const instruction = SystemProgram.createAccountWithSeed({
    fromPubkey: signer.publicKey,
    basePubkey: signer.publicKey,
    seed: "campaign1",
    newAccountPubkey,
    lamports,
    space: 1024,
    programId : new PublicKey("<ENTER PROGRAM ID HERE>"),
  });
  const transaction = new Transaction().add(
    instruction
  );

  console.log(`The address of campaign1 account is : ${newAccountPubkey.toBase58()}`);

  await sendAndConfirmTransaction(connection, transaction, [signer]);

}

establishConnection(); //call the function 
createAccount();
