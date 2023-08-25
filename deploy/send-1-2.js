const { ethers } = require("hardhat")
const endpoints = require("./endpoints")

// should be deployed on goerli / mainnet
async function main() {
    const LOCAL_NETWORK = process.env.TESTNET === "1" ? "FUJI" : "AVAX"
    const REMOTE_NETWORK = process.env.TESTNET === "1" ? "GOERLI" : "MAINNET"
    const DEPLOYER = process.env.TESTNET === "1" ? "DEPLOYER_TESTNET" : "DEPLOYER_MAINNET"

    const [deployer] = await ethers.getSigners()
    if (deployer.address !== process.env[DEPLOYER]) throw Error("deployer address is not correct")
    const chainId = await deployer.getChainId()
    if (chainId != process.env[`CHAIN_ID_${REMOTE_NETWORK}`]) throw Error(" chainId is not correct")

    // const localAddress = process.env[`OFT_${LOCAL_NETWORK}`]
    const remoteAddress = process.env[`OFT_${REMOTE_NETWORK}`]
    const localChainId = endpoints[`ENDPOINT_CHAIN_ID_${LOCAL_NETWORK}`]
    // const remoteChainId = endpoints[`ENDPOINT_CHAIN_ID_${REMOTE_NETWORK}`]

    // const token = process.env[`TOKEN_${LOCAL_NETWORK}`]
    const deployerAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [deployer.address])
    const amount = ethers.utils.parseEther("100")

    // fee
    const remoteOFT = await ethers.getContractAt("OFTV2", remoteAddress)
    const { nativeFee } = await remoteOFT.estimateSendFee(localChainId, deployerAddressBytes32, amount, false, "0x")
    console.log(`1-4: native fee is ${ethers.utils.formatEther(nativeFee)}`)

    // send
    await remoteOFT
        .connect(deployer)
        .sendFrom(deployer.address, localChainId, deployerAddressBytes32, amount, [deployer.address, ethers.constants.AddressZero, "0x"], {
            value: nativeFee,
        })
    console.log(`1-5: sent successfully`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
