import * as web3 from "@solana/web3.js"
import * as fs from "fs"
import dotenv from "dotenv"
dotenv.config()

export async function initializeKeypair(
  connection: web3.Connection
): Promise<web3.Keypair> {
  if (!process.env.PRIVATE_KEY) {
    console.log("Creating .env file")
    const signer = web3.Keypair.generate()
    fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey.toString()}]`)
    await airdropSolIfNeeded(signer, connection)

    return signer
  }

  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
  const secretKey = Uint8Array.from(secret)
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
  await airdropSolIfNeeded(keypairFromSecretKey, connection)
  return keypairFromSecretKey
}

async function airdropSolIfNeeded(
  signer: web3.Keypair,
  connection: web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey)
  console.log("Current balance is", balance )

 /* if (balance < web3.LAMPORTS_PER_SOL) {
    console.log("Airdropping 1 SOL...")
    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      web3.LAMPORTS_PER_SOL
    )

    const latestBlockHash = await connection.getLatestBlockhash()

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    })

    const newBalance = await connection.getBalance(signer.publicKey)
    console.log("New balance is", newBalance / web3.LAMPORTS_PER_SOL)
  }*/
}

//   import { initializeKeypair } from "./initializeKeypair"
// import {
//   Connection,
//   clusterApiUrl,
//   Transaction,
//   sendAndConfirmTransaction,
//   Keypair,
//   SystemProgram,
// } from "@solana/web3.js"
// import {
//   createInitializeMintInstruction,
//   getMinimumBalanceForRentExemptMint,
//   getAssociatedTokenAddress,
//   MINT_SIZE,
//   TOKEN_PROGRAM_ID,
//   createAssociatedTokenAccountInstruction,
//   Account,
//   TokenAccountNotFoundError,
//   TokenInvalidAccountOwnerError,
//   getAccount,
//   createMintToInstruction,
// } from "@solana/spl-token"
// import {
//   Metaplex,
//   keypairIdentity,
//   bundlrStorage,
//   toMetaplexFile,
//   findMetadataPda,
// } from "@metaplex-foundation/js"
// import {
//   DataV2,
//   createCreateMetadataAccountV2Instruction,
// } from "@metaplex-foundation/mpl-token-metadata"
// import * as fs from "fs"

// const tokenName = "Token Name"
// const description = "Description"
// const symbol = "SYMBOL"
// const decimals = 2
// const amount = 1

// async function main() {
//   const connection = new Connection(clusterApiUrl("devnet"))
//   const user = await initializeKeypair(connection)

//   console.log("PublicKey:", user.publicKey.toBase58())

//   // rent for token mint
//   const lamports = await getMinimumBalanceForRentExemptMint(connection)

//   // keypair for new token mint
//   const mintKeypair = Keypair.generate()

//   // get metadata PDA for token mint
//   const metadataPDA = await findMetadataPda(mintKeypair.publicKey)

//   // get associated token account address for use
//   const tokenATA = await getAssociatedTokenAddress(
//     mintKeypair.publicKey,
//     user.publicKey
//   )

//   // metaplex setup
//   const metaplex = Metaplex.make(connection)
//     .use(keypairIdentity(user))
//     .use(
//       bundlrStorage({
//         address: "https://devnet.bundlr.network",
//         providerUrl: "https://api.devnet.solana.com",
//         timeout: 60000,
//       })
//     )

//   // file to buffer
//   const buffer = fs.readFileSync("src/test.png")

//   // buffer to metaplex file
//   const file = toMetaplexFile(buffer, "test.png")

//   // upload image and get image uri
//   const imageUri = await metaplex.storage().upload(file)
//   console.log("image uri:", imageUri)

//   // upload metadata and get metadata uri (off chain metadata)
//   const { uri } = await metaplex
//     .nfts()
//     .uploadMetadata({
//       name: tokenName,
//       description: description,
//       image: imageUri,
//     })
//     .run()

//   console.log("metadata uri:", uri)

//   // onchain metadata format
//   const tokenMetadata = {
//     name: tokenName,
//     symbol: symbol,
//     uri: uri,
//     sellerFeeBasisPoints: 0,
//     creators: null,
//     collection: null,
//     uses: null,
//   } as DataV2

//   // transaction to create metadata account
//   const transaction = new Transaction().add(
//     // create new account
//     SystemProgram.createAccount({
//       fromPubkey: user.publicKey,
//       newAccountPubkey: mintKeypair.publicKey,
//       space: MINT_SIZE,
//       lamports: lamports,
//       programId: TOKEN_PROGRAM_ID,
//     }),
//     // create new token mint
//     createInitializeMintInstruction(
//       mintKeypair.publicKey,
//       decimals,
//       user.publicKey,
//       user.publicKey,
//       TOKEN_PROGRAM_ID
//     ),
//     // create metadata account
//     createCreateMetadataAccountV2Instruction(
//       {
//         metadata: metadataPDA,
//         mint: mintKeypair.publicKey,
//         mintAuthority: user.publicKey,
//         payer: user.publicKey,
//         updateAuthority: user.publicKey,
//       },
//       {
//         createMetadataAccountArgsV2: {
//           data: tokenMetadata,
//           isMutable: true,
//         },
//       }
//     )
//   )

//   // instruction to create ATA
//   const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
//     user.publicKey, // payer
//     tokenATA, // token address
//     user.publicKey, // token owner
//     mintKeypair.publicKey // token mint
//   )

//   let tokenAccount: Account
//   try {
//     // check if token account already exists
//     tokenAccount = await getAccount(
//       connection, // connection
//       tokenATA // token address
//     )
//   } catch (error: unknown) {
//     if (
//       error instanceof TokenAccountNotFoundError ||
//       error instanceof TokenInvalidAccountOwnerError
//     ) {
//       try {
//         // add instruction to create token account if one does not exist
//         transaction.add(createTokenAccountInstruction)
//       } catch (error: unknown) {}
//     } else {
//       throw error
//     }
//   }

//   transaction.add(
//     // mint tokens to token account
//     createMintToInstruction(
//       mintKeypair.publicKey,
//       tokenATA,
//       user.publicKey,
//       amount * Math.pow(10, decimals)
//     )
//   )

//   // send transaction
//   const transactionSignature = await sendAndConfirmTransaction(
//     connection,
//     transaction,
//     [user, mintKeypair]
//   )

//   console.log(
//     `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
//   )
// }

// main()
//   .then(() => {
//     console.log("Finished successfully")
//     process.exit(0)
//   })
//   .catch((error) => {
//     console.log(error)
//     process.exit(1)
//   })
