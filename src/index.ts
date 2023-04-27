import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  findMetadataPda,
} from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import * as fs from "fs";

import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
// async function createTokenWithMetaplex(){
//   // Variables
//   const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
//   const user = await initializeKeypair(connection);
//   const payer = user
//   const mintAuthority = user.publicKey
//   const freezeAuthority = user.publicKey
//   const decimals = 4
//   const owner = user.publicKey

//   // Instructions
//   // Create Token
//   const tokenMint = await token.createMint(
//     connection,
//     payer,
//     mintAuthority,
//     freezeAuthority,
//     decimals
//   );

//    // metaplex setup
//    const metaplex = Metaplex.make(connection)
//    .use(keypairIdentity(user))
//    .use(
//      bundlrStorage({
//        address: "https://devnet.bundlr.network",
//        providerUrl: "https://api.devnet.solana.com",
//        timeout: 60000,
//      })
//    );

//    // file to buffer
//   const buffer = fs.readFileSync("assets/emekcoinV2-logo.png");

//   // buffer to metaplex file
//   const file = toMetaplexFile(buffer, "emekcoinV2-logo.png");

//   // upload image and get image uri
//   const imageUri = await metaplex.storage().upload(file);
//   console.log("image uri:", imageUri);

//   // upload metadata and get metadata uri (off chain metadata)
//   const { uri } = await metaplex.nfts().uploadMetadata({
//     name: "EmekV2",
//     description: "for all workers of the world",
//     image: imageUri,
//   });

//   console.log("metadata uri:", uri);

//   // get metadata account address
//   const metadataPDA = await findMetadataPda(tokenMint);

//   // onchain metadata format
//   const tokenMetadata = {
//     name: "EmekV2",
//     symbol: "EME",
//     uri: uri,
//     sellerFeeBasisPoints: 0,
//     creators: null,
//     collection: null,
//     uses: null,
//   } as DataV2;

//   // transaction to create metadata account
//   const transaction = new web3.Transaction().add(
//     createCreateMetadataAccountV2Instruction(
//       {
//         metadata: metadataPDA,
//         mint: tokenMint,
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
//   );

//   // Create Token Account
//   const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
//     connection,
//     payer,
//     tokenMint,
//     owner
//   );

//   // Mint Token
//   const mintInfo = await token.getMint(connection, tokenMint);

//   const transactionSignature = await token.mintTo(
//     connection,
//     payer,
//     tokenMint,
//     tokenAccount.address,
//     user,
//     200 * 10 ** mintInfo.decimals
//   );

// }

async function main() {
  // Variables
  // const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const connection = new web3.Connection("https://solana-api.syndica.io/access-token/0VWYlEI9VqzgbwNyVPcXNffVN0e3ZTODtZfOaZQmHKN0cqVGgZEJlHBBx37QDOeW/rpc ", "confirmed"); //lts test this 
  const user = await initializeKeypair(connection);
  const payer = user;
  const myAddress = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
  const mintAuthority = user.publicKey;
  const freezeAuthority = user.publicKey;
  const decimals = 4;
  const owner = user.publicKey;

  // Instructions
  // Create Token
  const tokenMint = await token.createMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    decimals
  );
  console.log("TOKEN MINT BİLGİLERİ:");
  console.log(`The token mint account address is ${tokenMint}`);
  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=mainnet-beta`
  );

  // Create Token Account
  //  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMint,
    myAddress
  );
  console.log(tokenAccount.address);
  // Mint Token
  const mintInfo = await token.getMint(connection, tokenMint);
  // Check if user already has a token account
  if (tokenAccount) {
    // Mint tokens to existing token account by adding the amount to the existing balance
    const transactionSignature = await token.mintTo(
      connection,
      payer,
      tokenMint,
      tokenAccount.address,
      user, // Replace `user` with the receiver's public key
      3 * 10 ** mintInfo.decimals
    );
    console.log(
      `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=minnet`
    );
  } else {
    // Create a new token account and mint tokens to that account with the given amount
    const newTokenAccount = await token.createAssociatedTokenAccount(
      connection,
      user,
      myAddress,
      tokenMint
    );
    const transactionSignature = await token.mintTo(
      connection,
      payer,
      tokenMint,
      newTokenAccount,
      user, // Replace `user` with the receiver's public key
      3 * 10 ** mintInfo.decimals
    );
    console.log(
      `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet`
    );
  }
  // metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://node1.bundlr.network",
        providerUrl: "https://solana-api.syndica.io/access-token/0VWYlEI9VqzgbwNyVPcXNffVN0e3ZTODtZfOaZQmHKN0cqVGgZEJlHBBx37QDOeW/rpc",
        timeout: 60000,
      })
    );

  // file to buffer
  const buffer = fs.readFileSync("assets/fara.jpeg");

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "fara.jpeg");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: "Fahrenheit Root Labs COIN",
    description: "for all workers of the world",
    image: imageUri,
  });

  console.log("metadata uri:", uri);

  // get metadata account address
  const metadataPDA = await findMetadataPda(tokenMint);
  console.log(`GET METADATA ACCOUNT ADDRESS is : ${metadataPDA}`);

  // onchain metadata format
  const tokenMetadata = {
    name: "Fahrenheit Root Labs COIN",
    symbol: "FRLC",
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  console.log("=============================");
  console.log("CREATING TRANSACTION");
  console.log("=============================");
  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: tokenMint,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  );

  console.log(`METADATA TRANSACTİON : ${transaction}`);
  console.log("=============================");
  console.log("BEGIN SEND AND CONFIRMTRANSACTION");
  // send transaction
  const transactionSignature2 = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  );

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature2}?cluster=mainnet`
  );
  console.log("PublicKey:", user.publicKey.toBase58());
}
async function main2() {
  // Variables
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  const payer = user;
  const myAddress = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
  const mintAuthority = user.publicKey;
  const freezeAuthority = user.publicKey;
  const decimals = 4;
  const owner = user.publicKey;

  // Instructions
  // Create Token
  const tokenMint = await token.createMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    decimals
  );
  console.log("TOKEN MINT BİLGİLERİ:");
  console.log(`The token mint account address is ${tokenMint}`);
  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
  );

  // Create Token Account
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMint,
    myAddress
  );

  // Mint Token
  const mintInfo = await token.getMint(connection, tokenMint);

  const transactionSignature = await token.mintTo(
    connection,
    payer,
    tokenMint,
    tokenAccount.address,
    user,
    3 * 10 ** mintInfo.decimals
  );
  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
  // end mint token

  // metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // file to buffer
  const buffer = fs.readFileSync("assets/hum.jpeg");

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "hum.jpeg");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: "HUMIDITY Root Labs COIN",
    description: "for all workers of the world",
    image: imageUri,
  });

  console.log("metadata uri:", uri);

  // get metadata account address
  const metadataPDA = await findMetadataPda(tokenMint);
  console.log(`GET METADATA ACCOUNT ADDRESS is : ${metadataPDA}`);

  // onchain metadata format
  const tokenMetadata = {
    name: "HUMIDITY Root Labs COIN",
    symbol: "HRLC",
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  console.log("=============================");
  console.log("CREATING TRANSACTION");
  console.log("=============================");
  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: tokenMint,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  );

  console.log(`METADATA TRANSACTİON : ${transaction}`);
  console.log("=============================");
  console.log("BEGIN SENDANDCONFIRMTRANSACTION");
  // send transaction
  const transactionSignature2 = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  );

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature2}?cluster=devnet`
  );
  console.log("PublicKey:", user.publicKey.toBase58());
}
async function main3() {
  // Variables
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  const payer = user;
  const myAddress = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
  const mintAuthority = user.publicKey;
  const freezeAuthority = user.publicKey;
  const decimals = 4;
  const owner = user.publicKey;

  // Instructions
  // Create Token
  const tokenMint = await token.createMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    decimals
  );
  console.log("TOKEN MINT BİLGİLERİ:");
  console.log(`The token mint account address is ${tokenMint}`);
  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
  );

  const tokenATA = await token.getAssociatedTokenAddress(
    user.publicKey,
    user.publicKey
  )
  console.log("token account found")
  const receiverTokenAccount = await token.getAccount(connection, tokenATA);
  console.log(receiverTokenAccount)
  if (!receiverTokenAccount) {
    // Create receiver's token account if it does not exist
    await token.getOrCreateAssociatedTokenAccount(connection, user, tokenMint, myAddress);
  }

  // Mint Token
  const mintInfo = await token.getMint(connection, tokenMint);

  const transactionSignature = await token.mintTo(
    connection,
    payer,
    tokenMint,
    receiverTokenAccount.address,
    user,
    3 * 10 ** mintInfo.decimals
  );

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
  // end mint token

  // metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // file to buffer
  const buffer = fs.readFileSync("assets/ph.png");

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "ph.png");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: "PH Root Labs COIN",
    description: "for all workers of the world",
    image: imageUri,
  });

  console.log("metadata uri:", uri);

  // get metadata account address
  const metadataPDA = await findMetadataPda(tokenMint);
  console.log(`GET METADATA ACCOUNT ADDRESS is : ${metadataPDA}`);

  // onchain metadata format
  const tokenMetadata = {
    name: "PH Root Labs COIN",
    symbol: "PRLC",
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  console.log("=============================");
  console.log("CREATING TRANSACTION");
  console.log("=============================");
  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: tokenMint,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  );

  console.log(`METADATA TRANSACTİON : ${transaction}`);
  console.log("=============================");
  console.log("BEGIN SEND AND CONFIRMTRANSACTION");
  // send transaction
  const transactionSignature2 = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  );

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature2}?cluster=devnet`
  );
  console.log("PublicKey:", user.publicKey.toBase58());
}
async function main4() {
  async function main4() {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
    const user = await initializeKeypair(connection);
    const payer = user;
    const myAddress = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
    const mintAuthority = user.publicKey;
    const freezeAuthority = user.publicKey;
    const decimals = 4;
    const owner = user.publicKey;

    const receiverPublicKey = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
    const tokenMint = await token.createMint(
      connection,
      user,
      user.publicKey,
      user.publicKey,
      decimals
    );
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
      connection,
      user,
      tokenMint,
      myAddress
    );
    console.log(tokenAccount.address);
    // Mint Token
    const mintInfo = await token.getMint(connection, tokenMint);

    // Check if user already has a token account
    if (tokenAccount) {
      // Mint tokens to existing token account by adding the amount to the existing balance
      const transactionSignature = await token.mintTo(
        connection,
        payer,
        tokenMint,
        tokenAccount.address,
        user, // Replace `user` with the receiver's public key
        3 * 10 ** mintInfo.decimals
      );
      console.log(
        `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
      );
    } else {
      // Create a new token account and mint tokens to that account with the given amount
      const newTokenAccount = await token.createAssociatedTokenAccount(
        connection,
        user,
        myAddress,
        tokenMint
      );
      const transactionSignature = await token.mintTo(
        connection,
        payer,
        tokenMint,
        newTokenAccount,
        user, // Replace `user` with the receiver's public key
        3 * 10 ** mintInfo.decimals
      );
      console.log(
        `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
      );
    }
  }
}
async function main5() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  const payer = user;
  const myAddress = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
  const mintAuthority = user.publicKey;
  const freezeAuthority = user.publicKey;
  const decimals = 4;
  const owner = user.publicKey;

  const receiverPublicKey = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
  const tokenMint = await token.createMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    decimals
  );

  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMint,
    myAddress
  );
  console.log(tokenAccount.address);
  // Mint Token
  const mintInfo = await token.getMint(connection, tokenMint);

  // Check if user already has a token account
  if (tokenAccount) {
    // Mint tokens to existing token account by adding the amount to the existing balance
    const transactionSignature = await token.mintTo(
      connection,
      payer,
      tokenMint,
      tokenAccount.address,
      user, // Replace `user` with the receiver's public key
      3 * 10 ** mintInfo.decimals
    );
    console.log(
      `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    );
  } else {
    // Create a new token account and mint tokens to that account with the given amount
    const newTokenAccount = await token.createAssociatedTokenAccount(
      connection,
      user,
      myAddress,
      tokenMint
    );
    const transactionSignature = await token.mintTo(
      connection,
      payer,
      tokenMint,
      newTokenAccount,
      user, // Replace `user` with the receiver's public key
      3 * 10 ** mintInfo.decimals
    );
    console.log(
      `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    );
  }
}
main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
