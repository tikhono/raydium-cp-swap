import * as anchor from "@coral-xyz/anchor";
import {Program, BN} from "@coral-xyz/anchor";
import {RaydiumCpSwap} from "../target/types/raydium_cp_swap";
import {setupSwapTest, updateUserDiscount, swap_base_input, swap_base_output, getUserDiscountAddress} from "./utils";
import {assert} from "chai";
import {getAccount, getAssociatedTokenAddressSync} from "@solana/spl-token";

describe("swap test", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const owner = anchor.Wallet.local().payer;

    const program = anchor.workspace.RaydiumCpSwap as Program<RaydiumCpSwap>;

    const confirmOptions = {
        skipPreflight: true,
    };

    it("swap base input without transfer fee", async () => {
        const {configAddress, poolAddress, poolState} = await setupSwapTest(
            program,
            anchor.getProvider().connection,
            owner,
            {
                config_index: 0,
                tradeFeeRate: new BN(10),
                protocolFeeRate: new BN(1000),
                fundFeeRate: new BN(25000),
                create_fee: new BN(0),
            },
            {transferFeeBasisPoints: 0, MaxFee: 0}
        );
        const inputToken = poolState.token0Mint;
        const inputTokenProgram = poolState.token0Program;
        const inputTokenAccountAddr = getAssociatedTokenAddressSync(
            inputToken,
            owner.publicKey,
            false,
            inputTokenProgram
        );
        const inputTokenAccountBefore = await getAccount(
            anchor.getProvider().connection,
            inputTokenAccountAddr,
            "processed",
            inputTokenProgram
        );
        await sleep(1000);
        let amount_in = new BN(100000000);
        await swap_base_input(
            program,
            owner,
            configAddress,
            inputToken,
            inputTokenProgram,
            poolState.token1Mint,
            poolState.token1Program,
            amount_in,
            new BN(0)
        );
        const inputTokenAccountAfter = await getAccount(
            anchor.getProvider().connection,
            inputTokenAccountAddr,
            "processed",
            inputTokenProgram
        );
        assert.equal(
            inputTokenAccountBefore.amount - inputTokenAccountAfter.amount,
            BigInt(amount_in.toString())
        );
    });

    it("swap base output without transfer fee", async () => {
        const {configAddress, poolAddress, poolState} = await setupSwapTest(
            program,
            anchor.getProvider().connection,
            owner,
            {
                config_index: 0,
                tradeFeeRate: new BN(10),
                protocolFeeRate: new BN(1000),
                fundFeeRate: new BN(25000),
                create_fee: new BN(0),
            },
            {transferFeeBasisPoints: 0, MaxFee: 0}
        );
        const inputToken = poolState.token0Mint;
        const inputTokenProgram = poolState.token0Program;
        const inputTokenAccountAddr = getAssociatedTokenAddressSync(
            inputToken,
            owner.publicKey,
            false,
            inputTokenProgram
        );
        const outputToken = poolState.token1Mint;
        const outputTokenProgram = poolState.token1Program;
        const outputTokenAccountAddr = getAssociatedTokenAddressSync(
            outputToken,
            owner.publicKey,
            false,
            outputTokenProgram
        );
        const outputTokenAccountBefore = await getAccount(
            anchor.getProvider().connection,
            outputTokenAccountAddr,
            "processed",
            outputTokenProgram
        );
        await sleep(1000);
        let amount_out = new BN(100000000);
        await swap_base_output(
            program,
            owner,
            configAddress,
            inputToken,
            inputTokenProgram,
            poolState.token1Mint,
            poolState.token1Program,
            amount_out,
            new BN(10000000000000),
            confirmOptions
        );
        const outputTokenAccountAfter = await getAccount(
            anchor.getProvider().connection,
            outputTokenAccountAddr,
            "processed",
            outputTokenProgram
        );
        assert.equal(
            outputTokenAccountAfter.amount - outputTokenAccountBefore.amount,
            BigInt(amount_out.toString())
        );
    });

    it("swap base output with transfer fee", async () => {
        const transferFeeConfig = {transferFeeBasisPoints: 5, MaxFee: 5000}; // %5
        const {configAddress, poolAddress, poolState} = await setupSwapTest(
            program,
            anchor.getProvider().connection,
            owner,
            {
                config_index: 0,
                tradeFeeRate: new BN(10),
                protocolFeeRate: new BN(1000),
                fundFeeRate: new BN(25000),
                create_fee: new BN(0),
            },
            transferFeeConfig
        );

        const inputToken = poolState.token0Mint;
        const inputTokenProgram = poolState.token0Program;
        const inputTokenAccountAddr = getAssociatedTokenAddressSync(
            inputToken,
            owner.publicKey,
            false,
            inputTokenProgram
        );
        const outputToken = poolState.token1Mint;
        const outputTokenProgram = poolState.token1Program;
        const outputTokenAccountAddr = getAssociatedTokenAddressSync(
            outputToken,
            owner.publicKey,
            false,
            outputTokenProgram
        );
        const outputTokenAccountBefore = await getAccount(
            anchor.getProvider().connection,
            outputTokenAccountAddr,
            "processed",
            outputTokenProgram
        );
        await sleep(1000);
        let amount_out = new BN(100000000);
        await swap_base_output(
            program,
            owner,
            configAddress,
            inputToken,
            inputTokenProgram,
            poolState.token1Mint,
            poolState.token1Program,
            amount_out,
            new BN(10000000000000),
            confirmOptions
        );
        const outputTokenAccountAfter = await getAccount(
            anchor.getProvider().connection,
            outputTokenAccountAddr,
            "processed",
            outputTokenProgram
        );
        assert.equal(
            outputTokenAccountAfter.amount - outputTokenAccountBefore.amount,
            BigInt(amount_out.toString())
        );
    });

    it("swap base input with transfer fee and with discount", async () => {
        const {configAddress, poolAddress, poolState} = await setupSwapTest(
            program,
            anchor.getProvider().connection,
            owner,
            {
                config_index: 0,
                tradeFeeRate: new BN(1000),
                protocolFeeRate: new BN(1000),
                fundFeeRate: new BN(1000),
                create_fee: new BN(0),
            },
            {transferFeeBasisPoints: 5, MaxFee: 5000}
        );
        const inputToken = poolState.token0Mint;
        const inputTokenProgram = poolState.token0Program;
        const inputTokenAccountAddr = getAssociatedTokenAddressSync(
            inputToken,
            owner.publicKey,
            false,
            inputTokenProgram
        );
        const inputTokenAccountBefore = await getAccount(
            anchor.getProvider().connection,
            inputTokenAccountAddr,
            "processed",
            inputTokenProgram
        );
        const outputToken = poolState.token1Mint;
        const outputTokenProgram = poolState.token1Program;
        const outputTokenAccountAddr = getAssociatedTokenAddressSync(
            outputToken,
            owner.publicKey,
            false,
            outputTokenProgram
        );
        const outputTokenAccountBefore = await getAccount(
            anchor.getProvider().connection,
            outputTokenAccountAddr,
            "processed",
            outputTokenProgram
        );

        await sleep(1000);
        let amount_in = new BN(100000000);
        await swap_base_input(
            program,
            owner,
            configAddress,
            inputToken,
            inputTokenProgram,
            outputToken,
            outputTokenProgram,
            amount_in,
            new BN(0)
        );
        const inputTokenAccountAfter = await getAccount(
            anchor.getProvider().connection,
            inputTokenAccountAddr,
            "processed",
            inputTokenProgram
        );
        assert.equal(
            inputTokenAccountBefore.amount - inputTokenAccountAfter.amount,
            BigInt(amount_in.toString())
        );
        const outputTokenAccountAfter = await getAccount(
            anchor.getProvider().connection,
            outputTokenAccountAddr,
            "processed",
            outputTokenProgram
        );

        const output_diff_without_discount = outputTokenAccountBefore.amount - outputTokenAccountAfter.amount;

        const inputTokenAccountBeforeSecondSwap = await getAccount(
            anchor.getProvider().connection,
            inputTokenAccountAddr,
            "processed",
            inputTokenProgram
        );
        const outputTokenAccountBeforeSecondSwap = await getAccount(
            anchor.getProvider().connection,
            outputTokenAccountAddr,
            "processed",
            outputTokenProgram
        );

        await updateUserDiscount(
            program,
            anchor.getProvider().connection,
            owner,
            owner.publicKey,
            new BN(200_000),
            confirmOptions
        );

        await sleep(1000);
        await swap_base_input(
            program,
            owner,
            configAddress,
            inputToken,
            inputTokenProgram,
            outputToken,
            outputTokenProgram,
            amount_in,
            new BN(0)
        );
        const inputTokenAccountAfterSecondSwap = await getAccount(
            anchor.getProvider().connection,
            inputTokenAccountAddr,
            "processed",
            inputTokenProgram
        );
        assert.equal(
            inputTokenAccountBeforeSecondSwap.amount - inputTokenAccountAfterSecondSwap.amount,
            BigInt(amount_in.toString())
        );
        const outputTokenAccountAfterSecondSwap = await getAccount(
            anchor.getProvider().connection,
            outputTokenAccountAddr,
            "processed",
            outputTokenProgram
        );

        const output_diff_with_discount = outputTokenAccountBeforeSecondSwap.amount - outputTokenAccountAfterSecondSwap.amount;
        console.log(outputTokenAccountBeforeSecondSwap.amount);
        console.log(outputTokenAccountAfterSecondSwap.amount);

        console.log(outputTokenAccountBefore.amount);
        console.log(outputTokenAccountAfter.amount);

        console.log(output_diff_with_discount);
        console.log(output_diff_without_discount);

        //TODO: make automatic check for discount apply
    });
});

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
