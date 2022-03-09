import { PublicKey } from "@solana/web3.js";

export enum Network {
  DEV,
  TEST,
  MAIN,
  LOCAL,
}

export const DEV_NET = {
  incept: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
  oracle: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
};
export const TEST_NET = {
  incept: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
  oracle: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
};
export const MAIN_NET = {
  incept: new PublicKey("Aw4gPAFKNV9hQpSZB9pdkBnniVDR13uidY3D5NMKKFUi"),
};
