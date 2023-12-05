const endpoints = require("./endpoints")

// should be deployed on arbitrum goerli / arbitrum mainnet
async function main() {
    const LOCAL_NETWORK = process.env.TESTNET === "1" ? "GOERLI" : "MAINNET"
    if (process.env.DEPLOY_NETWORK !== `ARBITRUM_${LOCAL_NETWORK}`) throw Error("deploy network is not correct")

    const remoteOFT = process.env[`REMOTE_OFT_ARBITRUM_${LOCAL_NETWORK}`]
    const name = "ETH Stable"
    const symbol = "ETHS"
    const sharedDecimals = 0
    const remoteEndpoint = endpoints[`ENDPOINT_ARBITRUM_${LOCAL_NETWORK}`]

    try {
        await run("verify:verify", {
            address: remoteOFT,
            contract: "contracts/token/oft/v2/OFTV2.sol:OFTV2",
            constructorArguments: [name, symbol, sharedDecimals, remoteEndpoint],
        })
    } catch (err) {
        console.error(err.message)
    }
    console.log(`1-4: ARBITRUM_${LOCAL_NETWORK} OFTV2 verified at`, remoteOFT)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
