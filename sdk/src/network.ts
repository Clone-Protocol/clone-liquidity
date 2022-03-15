import { PublicKey } from "@solana/web3.js";

export enum Network {
  DEV,
  TEST,
  MAIN,
  LOCAL,
}

export const LOCAL_NET = {
  incept: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
  oracle: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
  endpoint: "http://127.0.0.1:8899"
};
export const DEV_NET = {
  incept: new PublicKey("3Pn6bqVndJuBKyBQTo7jdSvVv37mXWR6oJUvX4Pfh8Zm"),
  oracle: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
  endpoint: "https://explorer-api.devnet.solana.com"
};
export const TEST_NET = {
  incept: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
  oracle: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
  endpoint: "https://127.0.0.1:8899"
};
export const MAIN_NET = {
  incept: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
  oracle: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
  endpoint: "https://127.0.0.1:8899"
};

/**
 * Pulls which network to use (LOCAL_NET, DEV_NET) from the environment variable `USE_NETWORK`.
 * DEV_NET can be activated by setting `USE_NETWORK='DEV_NET'` otherwise defaults to LOCAL_NET.
 * 
 * @returns { PublicKey, PublicKey, string }
 * 
 */
export const getNetworkDetailsFromEnv = () => {

  let details = LOCAL_NET;

  if (process.env.NEXT_PUBLIC_USE_NETWORK) {
    if (process.env.NEXT_PUBLIC_USE_NETWORK.toLowerCase() === "dev_net") {
      details = DEV_NET
    }
  }

  if (process.env.NEXT_PUBLIC_INCEPT_PROGRAM_ID) {
    details.incept = new PublicKey(process.env.NEXT_PUBLIC_INCEPT_PROGRAM_ID);
  }

  if (process.env.NEXT_PUBLIC_NETWORK_ENDPOINT) {
    details.endpoint = process.env.NEXT_PUBLIC_NETWORK_ENDPOINT;
  }

  return details
}
