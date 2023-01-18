const { expect } = require("chai")
const { ethers } = require("hardhat")
const tokenJSON =  require("../artifacts/contracts/token_bep20.sol/bananToken.json")

describe("BananShop", function() {
    let owner
    let buyer
    let router
    let bep20

    beforeEach(async function() {
        [owner, buyer] = await ethers.getSigners()

        const BananShop = await ethers.getContractFactory("BananShop", owner)
        router = await BananShop.deploy()
        await router.deployed()

        bep20 = new ethers.Contract(await router.token(), tokenJSON.abi, owner) // подключение к существующему смарт-контракту
    })

    it("owner and token should exist", async function(){
        expect(await router.owner()).to.eq(owner.address)

        expect(await router.token()).to.be.properAddress
    })

    it("allows to buy", async function(){
        const tokenAmount = 3
        const txData = {
            value:tokenAmount,
            to: router.address
        }

        const tx = await buyer.sendTransaction(txData)
        await tx.wait()

        expect(await bep20.balanceOf(buyer.address)).to.eq(tokenAmount)

        await expect(() => tx).to.changeEtherBalance(router, tokenAmount)

        await expect(tx).to.emit(router, "Purchase").withArgs(tokenAmount, buyer.address)
    })

    it("allows to sell", async function(){
        const tx = await buyer.sendTransaction({
            value: 30,
            to: router.address
        })
        await tx.wait()

        const sellAmount = 20

        const approval = await bep20.connect(buyer).approve(router.address, sellAmount)
        await approval.wait()

        const sellTx = await router.connect(buyer).sell(sellAmount)

        expect(await bep20.balanceOf(buyer.address)).to.eq(10)

        await expect(() => sellTx).to.changeEtherBalance(router, -sellAmount)

        await expect(sellTx).to.emit(router, "Sale").withArgs(sellAmount, buyer.address)
    })
})