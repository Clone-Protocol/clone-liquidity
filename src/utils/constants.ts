import { IS_DEV } from "~/data/networks"

export enum CreateAccountDialogStates {
	Closed,
	Initial,
	Reminder
}

export const NETWORK_NAME = IS_DEV ? "Devnet" : ""

export const ON_USD = IS_DEV ? "devUSD" : "USDC"

export const ON_USD_NAME = IS_DEV ? "Devnet USD" : "USDC"