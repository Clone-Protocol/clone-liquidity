


def func(
    committed_collateral_liquidity_pre_24hrs: float,
    user_committed_liquidity_time: list[int],
    user_committed_liquidity: list[float],
    committed_pool_liquidity: list[float],
    trading_block_time: list[int],
    trading_fees_in_collateral: list[float]
    ) -> float:

    user_index = 0
    swap_index = 0

    N = len(user_committed_liquidity_time)
    M = len(trading_block_time)

    current_user_liquidity = committed_collateral_liquidity_pre_24hrs
    current_fees_collected = 0.

    while swap_index < M:
        if user_index < N and user_committed_liquidity_time[user_index] < trading_block_time[swap_index]:
            current_user_liquidity = user_committed_liquidity[user_index]
            user_index += 1
        else:
            proportion_of_pool = current_user_liquidity / committed_pool_liquidity[swap_index]
            current_fees_collected += proportion_of_pool * trading_fees_in_collateral[swap_index]
            swap_index += 1

    return current_fees_collected



if __name__ == "__main__":  


    fees = func(
        committed_collateral_liquidity_pre_24hrs = 518.1818181,
        user_committed_liquidity_time = [1698795141,1698796781],
        user_committed_liquidity = [1381.8181801,862.9507008],
        committed_pool_liquidity = [1000518.1818181,1000518.1818181,1001381.8181801,1001381.8181801,1000862.9507008,1000862.9507008],
        trading_block_time = [1698788400,1698789013,1698795304,1698795326,1698797021,1698797055],
        trading_fees_in_collateral = [0.025069715426097,0.0248974,1.11956651487297,1.1155142,1.09370003280858,1.0898681]
    )
    print(fees)


