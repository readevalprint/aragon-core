const assertThrow = require('./helpers/assertThrow');
var FinanceApp = artifacts.require('../contrats/app/finance/FinanceApp')
var EtherToken = artifacts.require('../contrats/common/EtherToken')
var TestToken = artifacts.require('./helpers/TestToken')
var Vault = artifacts.require('../contrats/apps/vault/Vault')
const { getBalance } = require('./helpers/web3')
const { signatures, sendTransaction } = require('./helpers/web3')
const timer = require('./helpers/timer')
const zerothAddress = '0x'
const randomAddress = '0x0000000000000000000000000000000000001234'

contract('FinanceApp', accounts => {

  let token = {}
  const owner = accounts[0]
  const account1 = accounts[1]
  const account2 = accounts[2]

  beforeEach(async () => {
  })

  context('installed app', () => {
    let financeApp = {}
    let vault = {}
    let ethertoken = {}
    let token = {}

    beforeEach(async () => {
      financeApp = await FinanceApp.new()
      vault = await Vault.new()
      ethertoken = await EtherToken.new()
      token = await TestToken.new()
      await financeApp.initialize(vault.address, ethertoken.address)
    })

    it('newAccounting Periods are properly spaced', async () => {
        await financeApp.setDefaultAccountingPeriodSettings('0', '0', '*', '*', '*', '*', '*');  
        let t = await financeApp.startNextAccountingPeriod()
        let ap_id = await financeApp.getCurrentAccountingPeriodId()
        assert.equal(ap_id, 0, "Should be on the 1st (index 0) accounting period")
        t = await financeApp.startNextAccountingPeriod()
        ap_id = await financeApp.getCurrentAccountingPeriodId()
        assert.equal(ap_id, 0, "Should STILL be on the 1st (index 0) accounting period")
        await timer(864000) // 8640 seconds in a day
        t = await financeApp.startNextAccountingPeriod()
        ap_id = await financeApp.getCurrentAccountingPeriodId()
        assert.equal(ap_id, 1, "Should be on the 1 index (2nd) accounting period")
    })

    it("can deposit tokens", async () => {
        let amount = 1
        await token.mint(account1, 100)
        await token.approve(financeApp.address, amount, {from: account1})
        await financeApp.deposit(token.address, amount, {from: account1})
        let newBalance = await token.balanceOf(owner)
        assert.equal(newBalance.toNumber(), amount)
    })

  })
})
