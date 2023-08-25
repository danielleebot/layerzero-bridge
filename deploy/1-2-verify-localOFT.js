const endpoints = require("./endpoints")

// should be deployed on goerli / mainnet
async function main() {
    const LOCAL_NETWORK = process.env.TESTNET === "1" ? "GOERLI" : "MAINNET"
    if (process.env.DEPLOY_NETWORK !== LOCAL_NETWORK) throw Error("deploy network is not correct")

    const localOFT = process.env[`LOCAL_OFT_${LOCAL_NETWORK}`]
    const token = process.env[`TOKEN_${LOCAL_NETWORK}`]
    const sharedDecimals = 0
    const localEndpoint = endpoints[`ENDPOINT_${LOCAL_NETWORK}`]

    try {
        await run("verify:verify", {
            address: localOFT,
            contract: "contracts/token/oft/v2/ProxyOFTV2.sol:ProxyOFTV2",
            constructorArguments: [token, sharedDecimals, localEndpoint],
        })
    } catch (err) {
        console.error(err.message)
    }
    console.log(`1-2: ${LOCAL_NETWORK} ProxyOFTV2 verified at`, localOFT)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
