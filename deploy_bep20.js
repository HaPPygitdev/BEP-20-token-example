const hre = require("hardhat")
const ethers = hre.ethers

async function main() {
    const [signer] = await ethers.getSigners()

    const Bep = await ethers.getContractFactory('BananShop', signer)
    const bep = await Bep.deploy()
    await bep.deployed()
    console.log(bep.address)
    console.log(await bep.token())
}

main()
    .then(()=> process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1)
    });

// команда для запуска скрипта => деплоя контракта в локальную сеть
// npx hardhat run scripts\deploy_bep20.js --network localhost 