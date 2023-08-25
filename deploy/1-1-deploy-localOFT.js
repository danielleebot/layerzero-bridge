const { ethers } = require("hardhat")
const endpoints = require("./endpoints")

// should be deployed on goerli / mainnet
async function main() {
    const LOCAL_NETWORK = process.env.TESTNET === "1" ? "GOERLI" : "MAINNET"
    if (process.env.DEPLOY_NETWORK !== LOCAL_NETWORK) throw Error("deploy network is not correct")

    const [deployer] = await ethers.getSigners()
    if (deployer.address !== process.env[`DEPLOYER_${LOCAL_NETWORK}`]) throw Error("deployer address is not correct")
    const chainId = await deployer.getChainId()
    if (LOCAL_NETWORK === "GOERLI" && chainId !== 5) throw Error(" chainId is not correct")
    if (LOCAL_NETWORK === "MAINNET" && chainId !== 1) throw Error(" chainId is not correct")

    const token = process.env[`TOKEN_${LOCAL_NETWORK}`]
    const sharedDecimals = 0
    const localEndpoint = endpoints[`ENDPOINT_${LOCAL_NETWORK}`]

    // deploy
    const ProxyOFTV2 = await ethers.getContractFactory("ProxyOFTV2")
    const localOFT = await ProxyOFTV2.connect(deployer).deploy(token, sharedDecimals, localEndpoint)
    await localOFT.deployed()
    console.log(`1-1: ${LOCAL_NETWORK} ProxyOFTV2 deployed to`, localOFT.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
