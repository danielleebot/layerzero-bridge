const { ethers } = require("hardhat")
const endpoints = require("./endpoints")

// should be deployed on fuji / avax
async function main() {
    const LOCAL_NETWORK = process.env.TESTNET === "1" ? "FUJI" : "AVAX"
    const REMOTE_NETWORK = process.env.TESTNET === "1" ? "ARBITRUM_GOERLI" : "ARBITRUM_MAINNET"
    const DEPLOYER = process.env.TESTNET === "1" ? "DEPLOYER_TESTNET" : "DEPLOYER_MAINNET"

    const [deployer] = await ethers.getSigners()
    if (deployer.address !== process.env[DEPLOYER]) throw Error("deployer address is not correct")
    const chainId = await deployer.getChainId()
    if (chainId != process.env[`CHAIN_ID_${LOCAL_NETWORK}`]) throw Error(" chainId is not correct")

    const localAddress = process.env[`OFT_${LOCAL_NETWORK}`]
    // const remoteAddress = process.env[`OFT_${REMOTE_NETWORK}`]
    // const localChainId = endpoints[`ENDPOINT_CHAIN_ID_${LOCAL_NETWORK}`]
    const remoteChainId = endpoints[`ENDPOINT_CHAIN_ID_${REMOTE_NETWORK}`]

    const token = process.env[`TOKEN_${LOCAL_NETWORK}`]
    const deployerAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [deployer.address])
    const amount = ethers.utils.parseEther("100")

    // approve
    const erc20 = await ethers.getContractAt("IERC20", token)
    const allowance = await erc20.allowance(deployer.address, localAddress)
    if (allowance.lt(amount)) {
        await erc20.connect(deployer).approve(localAddress, amount)
    }
    console.log(`1-1: approved successfully`)

    // fee
    const localOFT = await ethers.getContractAt("ProxyOFTV2", localAddress)
    const { nativeFee } = await localOFT.estimateSendFee(remoteChainId, deployerAddressBytes32, amount, false, "0x")
    console.log(`1-2: native fee is ${ethers.utils.formatEther(nativeFee)}`)

    // send
    await localOFT
        .connect(deployer)
        .sendFrom(deployer.address, remoteChainId, deployerAddressBytes32, amount, [deployer.address, ethers.constants.AddressZero, "0x"], {
            value: nativeFee,
        })
    console.log(`1-3: sent successfully`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
