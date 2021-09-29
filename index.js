const {
    Connection,
    TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram,
  Keypair,
  } = require('@solana/web3.js'); // Import the appropriate module from web3.js

const fs   = require('mz/fs');

async function establishConnection() { // fn to establish the connection

    const rpcUrl = 'http://api.devnet.solana.com'; //rpcUrl is the address at which your solana blockchain is running, constant variable
  
    connection = new Connection(rpcUrl, 'confirmed');
  
    const version = await connection.getVersion(); // get the connection version after it has succesfully establish
  
    console.log('Connection to cluster established:', rpcUrl, version); //printout the rpcURL and version to prompt cli that is has been established
  
}
async function createKeypairFromFile() { // create privatekey from file to sign all transactions associated with your account
  const secretKeyString = await fs.readFile("~/.config/solana/id.json", {encoding: 'utf8'}); //read the private key file from local folder, it will be read as string 
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString)); //convert private key string to uint8 array
  return Keypair.fromSecretKey(secretKey); // return the private key to the function caller, converting it into a Keypair using fromSecretKey
}
async function createAccount() {

  const rpcUrl = 'http://api.devnet.solana.com';
  connection = new Connection(rpcUrl, 'confirmed');
  const signer = await createKeypairFromFile(); //create signer from your private key
  const newAccountPubkey = await PublicKey.createWithSeed( // create a private key using seed phrase to create new account
    signer.publicKey,
    "campaign1",
    new PublicKey("<ENTER PROGRAM ID HERE>"), //program id ,PDA
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
