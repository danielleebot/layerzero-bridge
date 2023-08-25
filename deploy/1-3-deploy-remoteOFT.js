const { ethers } = require("hardhat")
const endpoints = require("./endpoints")

// should be deployed on arbitrum goerli / arbitrum mainnet
async function main() {
    const LOCAL_NETWORK = process.env.TESTNET === "1" ? "GOERLI" : "MAINNET"
    if (process.env.DEPLOY_NETWORK !== `ARBITRUM_${LOCAL_NETWORK}`) throw Error("deploy network is not correct")

    const [deployer] = await ethers.getSigners()
    if (deployer.address !== process.env[`DEPLOYER_${LOCAL_NETWORK}`]) throw Error("deployer address is not correct")
    const chainId = await deployer.getChainId()
    if (LOCAL_NETWORK === "GOERLI" && chainId !== 421613) throw Error(" chainId is not correct")
    if (LOCAL_NETWORK === "MAINNET" && chainId !== 42161) throw Error(" chainId is not correct")

    const name = "ETH Stable"
    const symbol = "ETHS"
    const sharedDecimals = 0
    const remoteEndpoint = endpoints[`ENDPOINT_ARBITRUM_${LOCAL_NETWORK}`]

    // deploy
    const OFTV2 = await ethers.getContractFactory("OFTV2")
    const remoteOFT = await OFTV2.connect(deployer).deploy(name, symbol, sharedDecimals, remoteEndpoint)
    await remoteOFT.deployed()
    console.log(`1-3: ARBITRUM_${LOCAL_NETWORK} ProxyOFTV2 deployed to`, remoteOFT.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
