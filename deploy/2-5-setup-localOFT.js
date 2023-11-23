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

    const localAddress = process.env[`LOCAL_OFT_${LOCAL_NETWORK}`]
    const remoteAddress = process.env[`REMOTE_OFT_${LOCAL_NETWORK}`]
    // const localChainId = endpoints[`ENDPOINT_CHAIN_ID_${LOCAL_NETWORK}`]
    const remoteChainId = endpoints[`ENDPOINT_CHAIN_ID_OPTIMISM_${LOCAL_NETWORK}`]
    const remotePath = ethers.utils.solidityPack(["address", "address"], [remoteAddress, localAddress])
    // const localPath = ethers.utils.solidityPack(["address", "address"], [localAddress, remoteAddress])

    // deploy
    const localOFT = await ethers.getContractAt("ProxyOFTV2", localAddress)
    await localOFT.connect(deployer).setTrustedRemote(remoteChainId, remotePath)
    console.log(`1-5: ${LOCAL_NETWORK} ProxyOFTV2 set trust remote to OPTIMISM_${LOCAL_NETWORK}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
