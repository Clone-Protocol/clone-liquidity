import * as anchor from '@project-serum/anchor'
import { BN, Program, Provider } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress,createAssociatedTokenAccountInstruction,  getAccount, TokenAccountNotFoundError } from '@solana/spl-token'
import { Incept as InceptProgram, IDL } from './idl/incept'
import { sleep, mul, div, toScaledNumber, toScaledPercent } from './utils'
import { Network } from './network'
import { PublicKey, Connection, ConfirmOptions, TransactionInstruction, Transaction, Keypair } from '@solana/web3.js'

const RENT_PUBKEY = anchor.web3.SYSVAR_RENT_PUBKEY
const SYSTEM_PROGRAM_ID = anchor.web3.SystemProgram.programId

const TOKEN_DATA_SIZE = 130616
const COMET_POSITIONS_SIZE = 59208
const MINT_POSITIONS_SIZE = 24528
const LIQUIDITY_POSITIONS_SIZE = 16368

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

export class Incept {
	connection: Connection
	network: Network
	programId: PublicKey
	program: Program<InceptProgram>
	manager: Manager
	tokenData: TokenData
	opts?: ConfirmOptions
	managerAddress: [PublicKey, number]
	provider: Provider

	public constructor(
		connection: Connection,
		programId: PublicKey,
		provider: Provider,
		opts?: ConfirmOptions
	) {
		this.managerAddress = [PublicKey.default, 0]
		this.manager = {} as Manager
		this.tokenData = {} as TokenData
		this.connection = connection
		this.opts = opts
		this.provider = provider
		this.programId = programId
		this.program = new Program<InceptProgram>(IDL, this.programId, provider)
	}
	public async initializeManager(admin: PublicKey) {
		const managerPubkeyAndBump = await this.getManagerAddress()
		const usdiMint = anchor.web3.Keypair.generate()
		const liquidatedCometUsdiTokenAccount = anchor.web3.Keypair.generate()
		const tokenData = anchor.web3.Keypair.generate()

		await this.program.rpc.initializeManager(managerPubkeyAndBump[1], {
			accounts: {
				admin: admin,
				manager: managerPubkeyAndBump[0],
				usdiMint: usdiMint.publicKey,
				liquidatedCometUsdiTokenAccount: liquidatedCometUsdiTokenAccount.publicKey,
				tokenData: tokenData.publicKey,
				rent: RENT_PUBKEY,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SYSTEM_PROGRAM_ID,
			},
			instructions: [
				// @ts-ignore
				await this.program.account.tokenData.createInstruction(tokenData, TOKEN_DATA_SIZE),
			],
			signers: [usdiMint, tokenData, liquidatedCometUsdiTokenAccount],
		})
		this.managerAddress = managerPubkeyAndBump
		// @ts-ignore
		this.manager = (await this.program.account.manager.fetch(this.managerAddress[0])) as Manager
	}

	public async loadManager() {
		this.managerAddress = await this.getManagerAddress()
		// @ts-ignore
		this.manager = await this.getManagerAccount() as Manager
	}

	public onManagerAccountChange(fn: (state: Manager) => void) {
		this.program.account.manager.subscribe(this.managerAddress[0]).on('change', (state: Manager) => {
			fn(state)
		})
	}

	public onTokenDataChange(fn: (state: TokenData) => void) {
		this.program.account.tokenData.subscribe(this.manager.tokenData).on('change', (state: TokenData) => {
			fn(state)
		})
	}

	public async getCollateral(collateralIndex: number) {
		const tokenData = (await this.getTokenData()) as TokenData
		return tokenData.collaterals[collateralIndex]
	}

	public async initializeUser() {
		const [managerPubkey, managerBump] = await this.getManagerAddress()
		const managerAccount = await this.getManagerAccount()
		const [userPubkey, bump] = await this.getUserAddress()

		const cometPositionsAccount = anchor.web3.Keypair.generate()
		const mintPositionsAccount = anchor.web3.Keypair.generate()
		const liquidityPositionsAccount = anchor.web3.Keypair.generate()

		await this.program.rpc.initializeUser(managerBump, bump, {
			accounts: {
				user: this.provider.wallet.publicKey,
				manager: managerPubkey,
				userAccount: userPubkey,
				cometPositions: cometPositionsAccount.publicKey,
				mintPositions: mintPositionsAccount.publicKey,
				liquidityPositions: liquidityPositionsAccount.publicKey,
				usdiMint: managerAccount.usdiMint,
				rent: RENT_PUBKEY,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SYSTEM_PROGRAM_ID,
			},
			instructions: [
				// @ts-ignore
				await this.program.account.cometPositions.createInstruction(
					cometPositionsAccount,
					COMET_POSITIONS_SIZE
				),
				// @ts-ignore
				await this.program.account.mintPositions.createInstruction(mintPositionsAccount, MINT_POSITIONS_SIZE),
				// @ts-ignore
				await this.program.account.liquidityPositions.createInstruction(
					liquidityPositionsAccount,
					LIQUIDITY_POSITIONS_SIZE
				),
			],
			signers: [cometPositionsAccount, mintPositionsAccount, liquidityPositionsAccount],
		})
	}

	public async addCollateral(admin: PublicKey, scale: number, stable: Boolean, collateral_mint: PublicKey) {
		const [managerPubkey, managerBump] = await this.getManagerAddress()
		const vaultAccount = anchor.web3.Keypair.generate()

		await this.program.rpc.addCollateral(managerBump, scale, Number(stable), {
			accounts: {
				admin: admin,
				manager: managerPubkey,
				tokenData: this.manager.tokenData,
				collateralMint: collateral_mint,
				vault: vaultAccount.publicKey,
				rent: RENT_PUBKEY,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SYSTEM_PROGRAM_ID,
			},
			signers: [vaultAccount],
		})
	}

	public async initializePool(
		admin: PublicKey,
		stableCollateralRatio: number,
		cryptoCollateralRatio: number,
		oracle: PublicKey
	) {
		const [managerPubkey, managerBump] = await this.getManagerAddress()
		const managerAccount = await this.getManagerAccount()
		const usdiTokenAccount = anchor.web3.Keypair.generate()
		const iassetMintAccount = anchor.web3.Keypair.generate()
		const iassetTokenAccount = anchor.web3.Keypair.generate()
		const liquidationIassetTokenAccount = anchor.web3.Keypair.generate()
		const liquidityTokenMintAccount = anchor.web3.Keypair.generate()
		const cometLiquidityTokenAccount = anchor.web3.Keypair.generate()

		await this.program.rpc.initializePool(managerBump, stableCollateralRatio, cryptoCollateralRatio, {
			accounts: {
				admin: admin,
				manager: managerPubkey,
				tokenData: managerAccount.tokenData,
				usdiMint: managerAccount.usdiMint,
				usdiTokenAccount: usdiTokenAccount.publicKey,
				iassetMint: iassetMintAccount.publicKey,
				iassetTokenAccount: iassetTokenAccount.publicKey,
				liquidationIassetTokenAccount: liquidationIassetTokenAccount.publicKey,
				liquidityTokenMint: liquidityTokenMintAccount.publicKey,
				cometLiquidityTokenAccount: cometLiquidityTokenAccount.publicKey,
				oracle: oracle,
				rent: RENT_PUBKEY,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SYSTEM_PROGRAM_ID,
			},
			signers: [
				usdiTokenAccount,
				iassetMintAccount,
				iassetTokenAccount,
				liquidationIassetTokenAccount,
				liquidityTokenMintAccount,
				cometLiquidityTokenAccount,
			],
		})
	}

	public async getPool(poolIndex: number) {
		const tokenData = (await this.getTokenData()) as TokenData
		return tokenData.pools[poolIndex]
	}

	public async getPoolBalances(poolIndex: number) {
		let pool = await this.getPool(poolIndex)
		let iasset = 0;
		let usdi = 0;

		try {
			iasset = Number((await this.connection.getTokenAccountBalance(pool.iassetTokenAccount, 'confirmed')).value!.amount)
		} catch {}

		try {
			usdi = Number((await this.connection.getTokenAccountBalance(pool.usdiTokenAccount, 'confirmed')).value!.amount)
		} catch {}

		return [iasset, usdi]
	}

	public async getUsdiBalance() {

		let associatedTokenAccount = await this.getOrCreateUsdiAssociatedTokenAccount();

		return Number(associatedTokenAccount.amount) / 1000000000000;
	}

	public async getiAssetMints() {
		const tokenData = await this.getTokenData()
		let mints: PublicKey[] = []
		for (const [index, pool] of tokenData.pools.entries()) {
			if (index === Number(tokenData.numPools)) {
				break;
			}
			mints.push(pool.assetInfo.iassetMint)
		}
		return mints
	}

	public async getiAssetInfo() {
		const mints = await this.getiAssetMints()
		const iassetInfo = []
		let i = 0
		for (var mint of mints) {
			let poolBalances = await this.getPoolBalances(i)
			let price = poolBalances[1] / poolBalances[0]
			iassetInfo.push([i, price])
			i++
		}
		return iassetInfo
	}

	public async getMintiAssetData(index: number) {
		let assetInfo = await this.getAssetInfo(index)
		let poolBalances = await this.getPoolBalances(index)
		let price = poolBalances[1] / poolBalances[0]
		let associatedTokenAddress = (await this.getOrCreateAssociatedTokenAccount(assetInfo.iassetMint)).address
		let amount = (await this.connection.getTokenAccountBalance(associatedTokenAddress, 'confirmed')).value!.uiAmount
		console.log(Number(assetInfo.price.val))
		console.log(Number(assetInfo.price.scale))
		return [
			price,
			toScaledNumber(assetInfo.price),
			Number(assetInfo.stableCollateralRatio.val),
			Number(assetInfo.cryptoCollateralRatio.val),
			amount

		]
	}

	public async getUseriAssetInfo() {
		const mints = await this.getiAssetMints()
		const userInfo = []
		let i = 0
		for (var mint of mints) {
			let associatedTokenAddress = (
				await PublicKey.findProgramAddress(
					[this.provider.wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
					SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
				)
			)[0]
			let amount;
			try {
				amount = (await this.connection.getTokenAccountBalance(associatedTokenAddress, 'confirmed')).value!.uiAmount;
			} catch {
				amount = 0;
			}

			if (amount > 0) {
				let poolBalances = await this.getPoolBalances(i)
				let price = poolBalances[1] / poolBalances[0]
				userInfo.push([i, price, amount])
			}
			i++
		}
		return userInfo
	}

	public async getUserMintInfos() {
		const mintPositions = (await this.getMintPositions())
		const mintInfos = []
		for (let i = 0; i < Number(mintPositions.numPositions); i++) {
			let mintPosition = mintPositions.mintPositions[i]
			let poolIndex = mintPosition.poolIndex
			let collateralIndex = mintPosition.collateralIndex
			let assetInfo = await this.getAssetInfo(poolIndex)
			let collateral = await this.getCollateral(collateralIndex)
			let collateralAmount = mintPosition.collateralAmount
			let price = assetInfo.price
			let borrowedIasset = mintPosition.borrowedIasset
			let collateralRatio: Value
			let minCollateralRatio: Value
			if (collateral.stable) {
				collateralRatio = div(collateralAmount, mul(price, borrowedIasset))
				minCollateralRatio = assetInfo.stableCollateralRatio
			} else {
				let collateralAssetInfo = await this.getAssetInfo(collateral.poolIndex)
				let collateralPrice = collateralAssetInfo.price
				let collateralAmount = mintPosition.collateralAmount
				collateralRatio = div(mul(collateralPrice, collateralAmount), mul(price, borrowedIasset))
				minCollateralRatio = assetInfo.cryptoCollateralRatio
			}
			mintInfos.push([
				poolIndex,
				collateralIndex,
				toScaledNumber(price),
				toScaledNumber(borrowedIasset),
				toScaledNumber(collateralAmount),
				toScaledPercent(collateralRatio),
				toScaledPercent(minCollateralRatio),
			])
		}
		return mintInfos
	}

	public async getUserLiquidityInfos() {
		const liquidityPositions = (await this.getLiquidityPositions())
		const liquidityInfos = []
		for (let i = 0; i < Number(liquidityPositions.numPositions); i++) {
			let liquidityPosition = liquidityPositions.liquidityPositions[i]
			let poolIndex = liquidityPosition.poolIndex
			let pool = await this.getPool(poolIndex)
			let poolBalances = await this.getPoolBalances(poolIndex)
			let price = poolBalances[1] / poolBalances[0]
			let liquidityTokenAmount = toScaledNumber(liquidityPosition.liquidityTokenValue)
			// @ts-ignore
			let liquidityTokenSupply = await this.connection.getTokenSupply(pool.liquidityTokenMint).value.uiAmount
			let iassetValue = (poolBalances[0] * liquidityTokenAmount) / liquidityTokenSupply
			let usdiValue = (poolBalances[1] * liquidityTokenAmount) / liquidityTokenSupply
			liquidityInfos.push([poolIndex, price, iassetValue, usdiValue, liquidityTokenAmount])
		}
		return liquidityInfos
	}

	public async getUserCometInfos() {
		const cometPositions = await this.getCometPositions()
		const cometInfos = []
		for (let i = 0; i < Number(cometPositions.numPositions); i++) {
			let cometPosition = cometPositions.cometPositions[i]
			let poolIndex = cometPosition.poolIndex
			let collateralIndex = cometPosition.collateralIndex
			let assetInfo = await this.getAssetInfo(poolIndex)
			let lowerPriceRange = toScaledNumber(cometPosition.lowerPriceRange)
			let upperPriceRange = toScaledNumber(cometPosition.upperPriceRange)
			let oraclePrice = toScaledNumber(assetInfo.price)
			let poolBalances = await this.getPoolBalances(poolIndex)
			let ammPrice = poolBalances[1] / poolBalances[0]
			let minGap = Math.min(
				oraclePrice - lowerPriceRange,
				ammPrice - lowerPriceRange,
				upperPriceRange - oraclePrice,
				upperPriceRange - ammPrice
			)
			let indicatorPrice: number
			switch (minGap) {
				case oraclePrice - lowerPriceRange:
					indicatorPrice = oraclePrice
					break
				case ammPrice - lowerPriceRange:
					indicatorPrice = ammPrice
					break
				case upperPriceRange - oraclePrice:
					indicatorPrice = oraclePrice
					break
				case upperPriceRange - ammPrice:
					indicatorPrice = ammPrice
					break
				default:
					throw new Error('Not supported')
			}
			let centerPrice = div(cometPosition.borrowedIasset, cometPosition.borrowedUsdi)
			let liquidityTokenAmount = toScaledNumber(cometPosition.liquidityTokenValue)
			// @ts-ignore
			let liquidityTokenSupply = await this.connection.getTokenSupply(pool.liquidityTokenMint).value.uiAmount
			let iassetValue = (poolBalances[0] * liquidityTokenAmount) / liquidityTokenSupply
			let usdiValue = (poolBalances[0] * liquidityTokenAmount) / liquidityTokenSupply
			let borrowedIasset = toScaledNumber(cometPosition.borrowedIasset)
			let borrowedUsdi = toScaledNumber(cometPosition.borrowedIasset)
			let ildIsIasset: boolean
			let ild: number
			if (borrowedIasset > iassetValue) {
				ildIsIasset = true
				ild = borrowedIasset - iassetValue
			} else if (borrowedUsdi > usdiValue) {
				ildIsIasset = false
				ild = borrowedUsdi - usdiValue
			} else {
				ildIsIasset = false
				ild = 0
			}
			cometInfos.push([
				poolIndex,
				collateralIndex,
				indicatorPrice,
				toScaledNumber(centerPrice),
				lowerPriceRange,
				upperPriceRange,
				toScaledNumber(cometPosition.collateralAmount),
				ildIsIasset,
				ild,
				borrowedIasset,
				borrowedUsdi,
				liquidityTokenAmount,
			])
		}
		return cometInfos
	}


	public async getAssetInfo(poolIndex: number) {
		const tokenData = (await this.getTokenData()) as TokenData
		return tokenData.pools[poolIndex].assetInfo
	}

	public async getiAssetInfos() {
		const iassetInfo = []
		for (let i = 1; i < Number((await this.getTokenData()).numPools) + 1; i++) {
			let poolBalances = await this.getPoolBalances(i)
			let price = poolBalances[1] / poolBalances[0]
			iassetInfo.push([i, price])
		}
		return iassetInfo
	}

	public async updatePrices(signers: Array<Keypair>) {
		const updatePricesIx = await this.updatePricesInstruction()
		await this.provider.send(new Transaction().add(updatePricesIx), signers);
	}
	public async updatePricesInstruction() {
		const tokenData = await this.getTokenData()

		const priceFeeds = tokenData.pools
			.filter((pool) => !pool.assetInfo.priceFeedAddress.equals(PublicKey.default))
			.map((pool) => {
				return {
					pubkey: pool.assetInfo.priceFeedAddress,
					isWritable: false,
					isSigner: false,
				}
			})
		console.log(`TOKEN DATA POOLS:`)
		console.log(this.managerAddress[0].toString())
		return (await this.program.instruction.updatePrices(this.managerAddress[1], {
			accounts: {
				manager: this.managerAddress[0],
				tokenData: this.manager.tokenData,
			},
			remainingAccounts: priceFeeds,
		})) as TransactionInstruction
	}

	public async getTokenData() {
		// TODO: Probably a hacky fix, should find a better place to do this.
		if (Object.keys(this.manager).length === 0) {
			await this.loadManager();
		}
		// @ts-ignore
		return (await this.program.account.tokenData.fetch(this.manager.tokenData)) as TokenData
	}

	public async getLiquidityPositions() {
		// @ts-ignore
		let userAccount = await this.getUserAccount()
		return (await this.program.account.liquidityPositions.fetch(
			userAccount.liquidityPositions
		)) as LiquidityPositions
	}
	public async getLiquidityPosition(liquidityIndex: number) {
		return (await this.getLiquidityPositions()).liquidityPositions[liquidityIndex]
	}

	public async getMintPositions() {
		// @ts-ignore
		let userAccount = await this.getUserAccount()
		return (await this.program.account.mintPositions.fetch(userAccount.mintPositions)) as MintPositions
	}
	public async getMintPosition(mintIndex: number) {
		return (await this.getMintPositions()).mintPositions[mintIndex]
	}

	public async getCometPositions() {
		// @ts-ignore
		let userAccount = await this.getUserAccount()
		return (await this.program.account.cometPositions.fetch(userAccount.cometPositions)) as CometPositions
	}
	public async getCometPosition(cometIndex: number) {
		return (await this.getCometPositions()).cometPositions[cometIndex]
	}

	public async getManagerAddress() {
		return await PublicKey.findProgramAddress([Buffer.from('manager')], this.program.programId)
	}

	public async getManagerAccount() {
		// @ts-ignore
		return (await this.program.account.manager.fetch(this.managerAddress[0])) as Manager
	}

	public async getUserAddress() {
		const [userPubkey, bump] = await PublicKey.findProgramAddress(
			[Buffer.from('user'), this.provider.wallet.publicKey.toBuffer()],
			this.program.programId
		)
		return [userPubkey, bump] as [PublicKey, number]
	}

	public async getUserAccount() {
		return (await this.program.account.user.fetch((await this.getUserAddress())[0])) as User
	}

	public async mintUsdi(
		amount: BN,
		userUsdiTokenAccount: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralIndex: number,
		signers: Array<Keypair>
	) {
		const mintUsdiIx = await this.mintUsdiInstruction(
			amount,
			this.provider.wallet.publicKey,
			userUsdiTokenAccount,
			userCollateralTokenAccount,
			collateralIndex
		)
		await this.provider.send(new Transaction().add(mintUsdiIx), signers);
	}

	public async mintUsdiInstruction(
		amount: BN,
		user: PublicKey,
		userUsdiTokenAccount: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralIndex: number
	) {
		let tokenData = await this.getTokenData()
		return (await this.program.instruction.mintUsdi(this.managerAddress[1], new BN(amount), {
			accounts: {
				user: user,
				manager: this.managerAddress[0],
				tokenData: this.manager.tokenData,
				vault: tokenData.collaterals[collateralIndex].vault,
				usdiMint: this.manager.usdiMint,
				userUsdiTokenAccount: userUsdiTokenAccount,
				userCollateralTokenAccount: userCollateralTokenAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
			},
		})) as TransactionInstruction
	}

	public async initializeMintPosition(
		iassetAmount: BN,
		collateralAmount: BN,
		userCollateralTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		poolIndex: number,
		collateralIndex: number,
		signers: Array<Keypair>
	) {
		const updatePricesIx = await this.updatePricesInstruction()
		const initializeMintPositionsIx = await this.initializeMintPositionsInstruction(
			userCollateralTokenAccount,
			userIassetTokenAccount,
			iassetAmount,
			collateralAmount,
			poolIndex,
			collateralIndex
		)
		await this.provider.send(
			new Transaction().add(updatePricesIx).add(initializeMintPositionsIx),
			signers
		)
	}
	public async initializeMintPositionsInstruction(
		userCollateralTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		iassetAmount: BN,
		collateralAmount: BN,
		poolIndex: number,
		collateralIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()

		return (await this.program.instruction.initializeMintPosition(
			this.managerAddress[1],
			userAddress[1],
			iassetAmount,
			collateralAmount,
			{
				accounts: {
					user: this.provider.wallet.publicKey,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					mintPositions: userAccount.mintPositions,
					vault: tokenData.collaterals[collateralIndex].vault,
					userCollateralTokenAccount: userCollateralTokenAccount,
					iassetMint: tokenData.pools[poolIndex].assetInfo.iassetMint,
					userIassetTokenAccount: userIassetTokenAccount,
					oracle: tokenData.pools[poolIndex].assetInfo.priceFeedAddress,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async addCollateralToMint(
		user: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		collateralIndex: number,
		signers: Array<Keypair>
	) {
		const addCollateralToMintIx = await this.addCollateralToMintInstruction(
			user,
			userCollateralTokenAccount,
			collateralAmount,
			collateralIndex
		)
		await this.provider.send(new Transaction().add(addCollateralToMintIx), signers)
	}

	public async addCollateralToMintInstruction(
		user: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		collateralIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()

		return (await this.program.instruction.addCollateralToMint(
			this.managerAddress[1],
			userAddress[1],
			collateralIndex,
			collateralAmount,
			{
				accounts: {
					user: user,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					mintPositions: userAccount.mintPositions,
					vault: tokenData.collaterals[collateralIndex].vault,
					userCollateralTokenAccount: userCollateralTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async withdrawCollateralFromMint(
		user: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		collateralIndex: number,
		signers: Array<Keypair>
	) {
		const withdrawCollateralFromMintIx = await this.withdrawCollateralFromMintInstruction(
			user,
			userCollateralTokenAccount,
			collateralAmount,
			collateralIndex
		)
		await this.provider.send(new Transaction().add(withdrawCollateralFromMintIx), signers)
	}
	public async withdrawCollateralFromMintInstruction(
		user: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		collateralIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()

		return (await this.program.instruction.withdrawCollateralFromMint(
			this.managerAddress[1],
			userAddress[1],
			collateralIndex,
			collateralAmount,
			{
				accounts: {
					user: user,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					mintPositions: userAccount.mintPositions,
					vault: tokenData.collaterals[collateralIndex].vault,
					userCollateralTokenAccount: userCollateralTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async payBackiAssetToMint(
		user: PublicKey,
		userIassetTokenAccount: PublicKey,
		iassetAmount: BN,
		poolIndex: number,
		collateralIndex: number,
		signers: Array<Keypair>
	) {
		const payBackiAssetToMintIx = await this.payBackiAssetToMintInstruction(
			user,
			userIassetTokenAccount,
			iassetAmount,
			poolIndex,
			collateralIndex
		)
		await this.provider.send(new Transaction().add(payBackiAssetToMintIx), signers)
	}
	public async payBackiAssetToMintInstruction(
		user: PublicKey,
		userIassetTokenAccount: PublicKey,
		iassetAmount: BN,
		poolIndex: number,
		collateralIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()

		return (await this.program.instruction.payBackMint(
			this.managerAddress[1],
			userAddress[1],
			collateralIndex,
			iassetAmount,
			{
				accounts: {
					user: user,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					mintPositions: userAccount.mintPositions,
					iassetMint: tokenData.pools[poolIndex].assetInfo.iassetMint,
					userIassetTokenAccount: userIassetTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async addiAssetToMint(
		iassetAmount: BN,
		collateralAmount: BN,
		user: PublicKey,
		userCollateralTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		poolIndex: number,
		collateralIndex: number,
		signers: Array<Keypair>
	) {
		const updatePricesIx = await this.updatePricesInstruction()
		const addiAssetToMintIx = await this.addiAssetToMintInstruction(
			user,
			userIassetTokenAccount,
			iassetAmount,
			poolIndex,
			collateralIndex
		)
		await this.provider.send(new Transaction().add(updatePricesIx).add(addiAssetToMintIx), signers)
	}
	public async addiAssetToMintInstruction(
		user: PublicKey,
		userIassetTokenAccount: PublicKey,
		iassetAmount: BN,
		poolIndex: number,
		collateralIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()

		return (await this.program.instruction.addIassetToMint(
			this.managerAddress[1],
			userAddress[1],
			collateralIndex,
			iassetAmount,
			{
				accounts: {
					user: user,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					mintPositions: userAccount.mintPositions,
					iassetMint: tokenData.pools[poolIndex].assetInfo.iassetMint,
					userIassetTokenAccount: userIassetTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async initializeLiquidityPosition(
		iassetAmount: BN,
		user: PublicKey,
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		userLiquidityTokenAccount: PublicKey,
		poolIndex: number,
		signers: Array<Keypair>
	) {
		const initializeLiquidityPositionIx = await this.initializeLiquidityPositionInstruction(
			user,
			userUsdiTokenAccount,
			userIassetTokenAccount,
			userLiquidityTokenAccount,
			iassetAmount,
			poolIndex
		)
		await this.provider.send(new Transaction().add(initializeLiquidityPositionIx), signers)
	}
	public async initializeLiquidityPositionInstruction(
		user: PublicKey,
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		userLiquidityTokenAccount: PublicKey,
		iassetAmount: BN,
		poolIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAccount = await this.getUserAccount()

		return (await this.program.instruction.initializeLiquidityPosition(
			this.managerAddress[1],
			poolIndex,
			iassetAmount,
			{
				accounts: {
					user: user,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					liquidityPositions: userAccount.liquidityPositions,
					userUsdiTokenAccount: userUsdiTokenAccount,
					userIassetTokenAccount: userIassetTokenAccount,
					userLiquidityTokenAccount: userLiquidityTokenAccount,
					ammUsdiTokenAccount: tokenData.pools[poolIndex].usdiTokenAccount,
					ammIassetTokenAccount: tokenData.pools[poolIndex].iassetTokenAccount,
					liquidityTokenMint: tokenData.pools[poolIndex].liquidityTokenMint,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async provideLiquidity(
		iassetAmount: BN,
		user: PublicKey,
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		userLiquidityTokenAccount: PublicKey,
		poolIndex: number,
		signers: Array<Keypair>
	) {
		const provideLiquidityIx = await this.provideLiquidityInstruction(
			user,
			userUsdiTokenAccount,
			userIassetTokenAccount,
			userLiquidityTokenAccount,
			iassetAmount,
			poolIndex
		)
		await this.provider.send(new Transaction().add(provideLiquidityIx), signers)
	}
	public async provideLiquidityInstruction(
		user: PublicKey,
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		userLiquidityTokenAccount: PublicKey,
		iassetAmount: BN,
		liquidityPositionIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAccount = await this.getUserAccount()

		return (await this.program.instruction.provideLiquidity(
			this.managerAddress[1],
			liquidityPositionIndex,
			iassetAmount,
			{
				accounts: {
					user: user,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					liquidityPositions: userAccount.liquidityPositions,
					userUsdiTokenAccount: userUsdiTokenAccount,
					userIassetTokenAccount: userIassetTokenAccount,
					userLiquidityTokenAccount: userLiquidityTokenAccount,
					ammUsdiTokenAccount:
						tokenData.pools[
							(
								await this.getLiquidityPositions()
							).liquidityPositions[liquidityPositionIndex].poolIndex
						].usdiTokenAccount,
					ammIassetTokenAccount:
						tokenData.pools[
							(
								await this.getLiquidityPositions()
							).liquidityPositions[liquidityPositionIndex].poolIndex
						].iassetTokenAccount,
					liquidityTokenMint:
						tokenData.pools[
							(
								await this.getLiquidityPositions()
							).liquidityPositions[liquidityPositionIndex].poolIndex
						].liquidityTokenMint,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async withdrawLiquidity(
		iassetAmount: BN,
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		userLiquidityTokenAccount: PublicKey,
		poolIndex: number,
		signers: Array<Keypair>
	) {
		const withdrawLiquidityIx = await this.withdrawLiquidityInstruction(
			userUsdiTokenAccount,
			userIassetTokenAccount,
			userLiquidityTokenAccount,
			iassetAmount,
			poolIndex
		)
		await this.provider.send(new Transaction().add(withdrawLiquidityIx), signers)
	}
	public async withdrawLiquidityInstruction(
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		userLiquidityTokenAccount: PublicKey,
		iassetAmount: BN,
		liquidityPositionIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAccount = await this.getUserAccount()

		return (await this.program.instruction.withdrawLiquidity(
			this.managerAddress[1],
			liquidityPositionIndex,
			iassetAmount,
			{
				accounts: {
					user: this.provider.wallet.publicKey,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					liquidityPositions: userAccount.liquidityPositions,
					userUsdiTokenAccount: userUsdiTokenAccount,
					userIassetTokenAccount: userIassetTokenAccount,
					userLiquidityTokenAccount: userLiquidityTokenAccount,
					ammUsdiTokenAccount:
						tokenData.pools[
							(
								await this.getLiquidityPositions()
							).liquidityPositions[liquidityPositionIndex].poolIndex
						].usdiTokenAccount,
					ammIassetTokenAccount:
						tokenData.pools[
							(
								await this.getLiquidityPositions()
							).liquidityPositions[liquidityPositionIndex].poolIndex
						].iassetTokenAccount,
					liquidityTokenMint:
						tokenData.pools[
							(
								await this.getLiquidityPositions()
							).liquidityPositions[liquidityPositionIndex].poolIndex
						].liquidityTokenMint,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async buySynth(
		iassetAmount: BN,
		user: PublicKey,
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		poolIndex: number,
		signers: Array<Keypair>
	) {
		const buySynthIx = await this.buySynthInstruction(
			user,
			userUsdiTokenAccount,
			userIassetTokenAccount,
			iassetAmount,
			poolIndex
		)
		await this.provider.send(new Transaction().add(buySynthIx), signers)
	}
	public async buySynthInstruction(
		user: PublicKey,
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		iassetAmount: BN,
		poolIndex: number
	) {
		let tokenData = await this.getTokenData()

		return (await this.program.instruction.buySynth(this.managerAddress[1], poolIndex, iassetAmount, {
			accounts: {
				user: user,
				manager: this.managerAddress[0],
				tokenData: this.manager.tokenData,
				userUsdiTokenAccount: userUsdiTokenAccount,
				userIassetTokenAccount: userIassetTokenAccount,
				ammUsdiTokenAccount: tokenData.pools[poolIndex].usdiTokenAccount,
				ammIassetTokenAccount: tokenData.pools[poolIndex].iassetTokenAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
			},
		})) as TransactionInstruction
	}

	public async sellSynth(
		iassetAmount: BN,
		user: PublicKey,
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		poolIndex: number,
		signers: Array<Keypair>
	) {
		const buySynthIx = await this.buySynthInstruction(
			user,
			userUsdiTokenAccount,
			userIassetTokenAccount,
			iassetAmount,
			poolIndex
		)
		await this.provider.send(new Transaction().add(buySynthIx), signers)
	}
	public async sellSynthInstruction(
		user: PublicKey,
		userUsdiTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		iassetAmount: BN,
		poolIndex: number
	) {
		let tokenData = await this.getTokenData()

		return (await this.program.instruction.sellSynth(this.managerAddress[1], poolIndex, iassetAmount, {
			accounts: {
				user: user,
				manager: this.managerAddress[0],
				tokenData: this.manager.tokenData,
				userUsdiTokenAccount: userUsdiTokenAccount,
				userIassetTokenAccount: userIassetTokenAccount,
				ammUsdiTokenAccount: tokenData.pools[poolIndex].usdiTokenAccount,
				ammIassetTokenAccount: tokenData.pools[poolIndex].iassetTokenAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
			},
		})) as TransactionInstruction
	}

	public async initializeComet(
		user: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		usdiAmount: BN,
		poolIndex: number,
		collateralIndex: number,
		signers: Array<Keypair>
	) {
		const initializeCometIx = await this.initializeCometInstruction(
			user,
			userCollateralTokenAccount,
			collateralAmount,
			usdiAmount,
			poolIndex,
			collateralIndex
		)
		await this.provider.send(new Transaction().add(initializeCometIx), signers)
	}
	public async initializeCometInstruction(
		user: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		usdiAmount: BN,
		poolIndex: number,
		collateralIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()

		return (await this.program.instruction.initializeComet(
			this.managerAddress[1],
			userAddress[1],
			poolIndex,
			collateralAmount,
			usdiAmount,
			{
				accounts: {
					user: user,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					usdiMint: this.manager.usdiMint,
					iassetMint: tokenData.pools[poolIndex].assetInfo.iassetMint,
					userCollateralTokenAccount: userCollateralTokenAccount,
					cometPositions: userAccount.cometPositions,
					ammUsdiTokenAccount: tokenData.pools[poolIndex].usdiTokenAccount,
					ammIassetTokenAccount: tokenData.pools[poolIndex].iassetTokenAccount,
					liquidityTokenMint: tokenData.pools[poolIndex].liquidityTokenMint,
					cometLiquidityTokenAccount: tokenData.pools[poolIndex].cometLiquidityTokenAccount,
					vault: tokenData.collaterals[collateralIndex].vault,
					rent: RENT_PUBKEY,
					tokenProgram: TOKEN_PROGRAM_ID,
					systemProgram: SYSTEM_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async addCollateralToComet(
		user: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		cometIndex: number,
		signers: Array<Keypair>
	) {
		const addCollateralToCometIx = await this.addCollateralToCometInstruction(
			user,
			userCollateralTokenAccount,
			collateralAmount,
			cometIndex
		)
		await this.provider.send(new Transaction().add(addCollateralToCometIx), signers)
	}
	public async addCollateralToCometInstruction(
		user: PublicKey,
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		cometIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()
		let cometPosition = await this.getCometPosition(cometIndex)

		return (await this.program.instruction.addCollateralToComet(
			this.managerAddress[1],
			userAddress[1],
			cometIndex,
			collateralAmount,
			{
				accounts: {
					user: user,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					cometPositions: userAccount.cometPositions,
					vault: tokenData.collaterals[cometPosition.collateralIndex].vault,
					userCollateralTokenAccount: userCollateralTokenAccount,
					ammUsdiTokenAccount: tokenData.pools[cometPosition.poolIndex].usdiTokenAccount,
					ammIassetTokenAccount: tokenData.pools[cometPosition.poolIndex].iassetTokenAccount,
					liquidityTokenMint: tokenData.pools[cometPosition.poolIndex].liquidityTokenMint,
					cometLiquidityTokenAccount: tokenData.pools[cometPosition.poolIndex].cometLiquidityTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async withdrawCollateralFromComet(
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		cometIndex: number,
		signers: Array<Keypair>
	) {
		const withdrawCollateralFromCometIx = await this.withdrawCollateralFromCometInstruction(
			userCollateralTokenAccount,
			collateralAmount,
			cometIndex
		)
		await this.provider.send(new Transaction().add(withdrawCollateralFromCometIx), signers)
	}
	public async withdrawCollateralFromCometInstruction(
		userCollateralTokenAccount: PublicKey,
		collateralAmount: BN,
		cometIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()
		let cometPosition = await this.getCometPosition(cometIndex)

		return (await this.program.instruction.withdrawCollateralFromComet(
			this.managerAddress[1],
			userAddress[1],
			cometIndex,
			collateralAmount,
			{
				accounts: {
					user: this.provider.wallet.publicKey,
					manager: this.managerAddress[0],
					tokenData: this.manager.tokenData,
					cometPositions: userAccount.cometPositions,
					vault: tokenData.collaterals[cometPosition.collateralIndex].vault,
					userCollateralTokenAccount: userCollateralTokenAccount,
					ammUsdiTokenAccount: tokenData.pools[cometPosition.poolIndex].usdiTokenAccount,
					ammIassetTokenAccount: tokenData.pools[cometPosition.poolIndex].iassetTokenAccount,
					liquidityTokenMint: tokenData.pools[cometPosition.poolIndex].liquidityTokenMint,
					cometLiquidityTokenAccount: tokenData.pools[cometPosition.poolIndex].cometLiquidityTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				},
			}
		)) as TransactionInstruction
	}

	public async closeComet(
		userCollateralTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		userUsdiTokenAccount: PublicKey,
		cometIndex: number,
		signers: Array<Keypair>
	) {
		const closeCometIx = await this.closeCometInstruction(
			userCollateralTokenAccount,
			userIassetTokenAccount,
			userUsdiTokenAccount,
			cometIndex
		)
		await this.provider.send(new Transaction().add(closeCometIx), signers)
	}
	public async closeCometInstruction(
		userCollateralTokenAccount: PublicKey,
		userIassetTokenAccount: PublicKey,
		userUsdiTokenAccount: PublicKey,
		cometIndex: number
	) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()
		let cometPosition = await this.getCometPosition(cometIndex)

		return (await this.program.instruction.closeComet(this.managerAddress[1], userAddress[1], cometIndex, {
			accounts: {
				user: this.provider.wallet.publicKey,
				manager: this.managerAddress[0],
				tokenData: this.manager.tokenData,
				usdiMint: this.manager.usdiMint,
				iassetMint: tokenData.pools[cometPosition.poolIndex].assetInfo.iassetMint,
				userCollateralTokenAccount: userCollateralTokenAccount,
				userIassetTokenAccount: userIassetTokenAccount,
				userUsdiTokenAccount: userUsdiTokenAccount,
				cometPositions: userAccount.cometPositions,
				cometLiquidityTokenAccount: tokenData.pools[cometPosition.poolIndex].cometLiquidityTokenAccount,
				ammUsdiTokenAccount: tokenData.pools[cometPosition.poolIndex].usdiTokenAccount,
				ammIassetTokenAccount: tokenData.pools[cometPosition.poolIndex].iassetTokenAccount,
				liquidityTokenMint: tokenData.pools[cometPosition.poolIndex].liquidityTokenMint,
				vault: tokenData.collaterals[cometPosition.collateralIndex].vault,
				tokenProgram: TOKEN_PROGRAM_ID,
			},
		})) as TransactionInstruction
	}

	public async recenterComet(
		userIassetTokenAccount: PublicKey,
		cometIndex: number,
		signers: Array<Keypair>
	) {
		const recenterCometIx = await this.recenterCometInstruction(userIassetTokenAccount, cometIndex)
		await this.provider.send(new Transaction().add(recenterCometIx), signers)
	}
	public async recenterCometInstruction(userIassetTokenAccount: PublicKey, cometIndex: number) {
		let tokenData = await this.getTokenData()
		let userAddress = await this.getUserAddress()
		let userAccount = await this.getUserAccount()
		let cometPosition = await this.getCometPosition(cometIndex)

		return (await this.program.instruction.recenterComet(this.managerAddress[1], userAddress[1], cometIndex, {
			accounts: {
				user: this.provider.wallet.publicKey,
				manager: this.managerAddress[0],
				tokenData: this.manager.tokenData,
				usdiMint: this.manager.usdiMint,
				iassetMint: tokenData.pools[cometPosition.poolIndex].assetInfo.iassetMint,
				userIassetTokenAccount: userIassetTokenAccount,
				cometPositions: userAccount.cometPositions,
				ammUsdiTokenAccount: tokenData.pools[cometPosition.poolIndex].usdiTokenAccount,
				ammIassetTokenAccount: tokenData.pools[cometPosition.poolIndex].iassetTokenAccount,
				liquidityTokenMint: tokenData.pools[cometPosition.poolIndex].liquidityTokenMint,
				vault: tokenData.collaterals[cometPosition.collateralIndex].vault,
				tokenProgram: TOKEN_PROGRAM_ID,
			},
		})) as TransactionInstruction
	}

	// Hackathon ONLY!

	public async hackathonMintUsdiInstruction(userUsdiTokenAccount: PublicKey, amount: number) {

		const [managerPubkey, managerBump] = await this.getManagerAddress();
		
		return (
			this.program.instruction.mintUsdiHackathon(
				managerBump,
				new BN(amount),
				{
					accounts: {
						user: this.provider.wallet.publicKey,
						manager: managerPubkey,
						tokenData: this.manager.tokenData,
						usdiMint: this.manager.usdiMint,
						userUsdiTokenAccount: userUsdiTokenAccount,
						tokenProgram: TOKEN_PROGRAM_ID
					}
				}
			)
		)
	}

	public async hackathonMintUsdi(userUsdiTokenAccount: PublicKey, amount: number) {

		const mintUsdiTx = await this.hackathonMintUsdiInstruction(
			userUsdiTokenAccount,
			amount
		);
		await this.provider.send(
			new Transaction().add(mintUsdiTx)
		);
	}

	public async getOrCreateAssociatedTokenAccount(mint: PublicKey) {
		const associatedToken = await getAssociatedTokenAddress(
			mint,
			this.provider.wallet.publicKey,
			false,
			TOKEN_PROGRAM_ID,
			ASSOCIATED_TOKEN_PROGRAM_ID
		);

		let account;
		try {
			account = await getAccount(this.connection, associatedToken, "finalized", TOKEN_PROGRAM_ID);
		} catch (error: unknown) {
			if (error instanceof TokenAccountNotFoundError) {
				const transaction = new Transaction().add(
					createAssociatedTokenAccountInstruction(
						this.provider.wallet.publicKey,
						associatedToken,
						this.provider.wallet.publicKey,
						mint,
						TOKEN_PROGRAM_ID,
						ASSOCIATED_TOKEN_PROGRAM_ID
					)
				);

				await this.provider.send(transaction);
				await sleep(200);
				account = await getAccount(this.connection, associatedToken, "finalized", TOKEN_PROGRAM_ID);
			} else {
				throw error;
			}
		}

		if (!account) {
			throw Error("Could not create account!");
		}
		return account;
	}

	public async getOrCreateUsdiAssociatedTokenAccount() {
		return await this.getOrCreateAssociatedTokenAccount(this.manager.usdiMint);
	}

	public async liquidateComet() {}
	public async liquidateCometInstruction() {}

	public async claimLiquidatedComet() {}
	public async claimLiquidatedCometInstruction() {}
}

export interface Manager {
	usdiMint: PublicKey
	liquidatedCometUsdi: PublicKey
	tokenData: PublicKey
	// admin: PublicKey;
}

export interface User {
	authority: PublicKey
	cometPositions: PublicKey
	mintPositions: PublicKey
	liquidityPositions: PublicKey
}

export interface TokenData {
	manager: PublicKey
	numPools: BN
	numCollaterals: BN
	pools: Array<Pool>
	collaterals: Array<Collateral>
}

export interface LiquidityPositions {
	owner: PublicKey
	numPositions: BN
	liquidityPositions: Array<LiquidityPosition>
}

export interface LiquidityPosition {
	authority: PublicKey
	liquidityTokenValue: Value
	poolIndex: number
}

export interface MintPositions {
	owner: PublicKey
	numPositions: BN
	mintPositions: Array<MintPosition>
}

export interface MintPosition {
	authority: PublicKey
	collateralAmount: Value
	poolIndex: number
	collateralIndex: number
	borrowedIasset: Value
}

export interface CometPositions {
	owner: PublicKey
	numPositions: BN
	cometPositions: Array<CometPosition>
}

export interface CometPosition {
	authority: PublicKey
	collateralAmount: Value
	poolIndex: number
	collateralIndex: number
	borrowedUsdi: Value
	borrowedIasset: Value
	liquidityTokenValue: Value
	lowerPriceRange: Value
	upperPriceRange: Value
	cometLiquidation: CometLiquidation
}

export interface CometLiquidation {
	liquidated: number
	excess_token_type_is_usdi: number
	excess_token_amount: Value
}

export interface Value {
	val: BN
	scale: number
}

export interface AssetInfo {
	iassetMint: PublicKey
	priceFeedAddress: PublicKey
	price: Value
	twap: Value
	confidence: Value
	status: number
	lastUpdate: number
	stableCollateralRatio: Value
	cryptoCollateralRatio: Value
}

export interface Pool {
	iassetTokenAccount: PublicKey
	usdiTokenAccount: PublicKey
	liquidityTokenMint: PublicKey
	liquidationIassetTokenAccount: PublicKey
	cometLiquidityTokenAccount: PublicKey
	assetInfo: AssetInfo
}

export interface Collateral {
	poolIndex: number
	mint: PublicKey
	vault: PublicKey
	vaultUsdiSupply: Value
	vaultMintSupply: Value
	vaultCometSupply: Value
	stable: number
}
