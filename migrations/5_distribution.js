// ============ Contracts ============


// Protocol
// deployed second
const SOLARITEImplementation = artifacts.require("SOLARITEDelegate");
const SOLARITEProxy = artifacts.require("SOLARITEDelegator");

// deployed third
const SOLARITEReserves = artifacts.require("SOLARITEReserves");
const SOLARITERebaser = artifacts.require("SOLARITERebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// deployed fourth
const SOLARITE_ETHPool = artifacts.require("SOLARITEETHPool");
const SOLARITE_uAMPLPool = artifacts.require("SOLARITEAMPLPool");
const SOLARITE_YFIPool = artifacts.require("SOLARITEYFIPool");
const SOLARITE_LINKPool = artifacts.require("SOLARITELINKPool");
const SOLARITE_MKRPool = artifacts.require("SOLARITEMKRPool");
const SOLARITE_LENDPool = artifacts.require("SOLARITELENDPool");
const SOLARITE_COMPPool = artifacts.require("SOLARITECOMPPool");
const SOLARITE_SNXPool = artifacts.require("SOLARITESNXPool");


// deployed fifth
const SOLARITEIncentivizer = artifacts.require("SOLARITEIncentivizer");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    // deployTestContracts(deployer, network),
    deployDistribution(deployer, network, accounts),
    // deploySecondLayer(deployer, network)
  ]);
}

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  console.log(network)
  let solarite = await SOLARITEProxy.deployed();
  let yReserves = await SOLARITEReserves.deployed()
  let yRebaser = await SOLARITERebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await deployer.deploy(SOLARITE_ETHPool);
    await deployer.deploy(SOLARITE_uAMPLPool);
    await deployer.deploy(SOLARITE_YFIPool);
    await deployer.deploy(SOLARITEIncentivizer);
    await deployer.deploy(SOLARITE_LINKPool);
    await deployer.deploy(SOLARITE_MKRPool);
    await deployer.deploy(SOLARITE_LENDPool);
    await deployer.deploy(SOLARITE_COMPPool);
    await deployer.deploy(SOLARITE_SNXPool);

    let eth_pool = new web3.eth.Contract(SOLARITE_ETHPool.abi, SOLARITE_ETHPool.address);
    let ampl_pool = new web3.eth.Contract(SOLARITE_uAMPLPool.abi, SOLARITE_uAMPLPool.address);
    let yfi_pool = new web3.eth.Contract(SOLARITE_YFIPool.abi, SOLARITE_YFIPool.address);
    let lend_pool = new web3.eth.Contract(SOLARITE_LENDPool.abi, SOLARITE_LENDPool.address);
    let mkr_pool = new web3.eth.Contract(SOLARITE_MKRPool.abi, SOLARITE_MKRPool.address);
    let snx_pool = new web3.eth.Contract(SOLARITE_SNXPool.abi, SOLARITE_SNXPool.address);
    let comp_pool = new web3.eth.Contract(SOLARITE_COMPPool.abi, SOLARITE_COMPPool.address);
    let link_pool = new web3.eth.Contract(SOLARITE_LINKPool.abi, SOLARITE_LINKPool.address);
    let ycrv_pool = new web3.eth.Contract(SOLARITEIncentivizer.abi, SOLARITEIncentivizer.address);

    console.log("setting distributor");
    await Promise.all([
        eth_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        ampl_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        yfi_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        ycrv_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        lend_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        mkr_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        snx_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        comp_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        link_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        ycrv_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      ]);

    let two_fifty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(250));
    let one_five = two_fifty.mul(web3.utils.toBN(6));

    console.log("transfering and notifying");
    console.log("eth");
    await Promise.all([
      solarite.transfer(SOLARITE_ETHPool.address, two_fifty.toString()),
      solarite.transfer(SOLARITE_uAMPLPool.address, two_fifty.toString()),
      solarite.transfer(SOLARITE_YFIPool.address, two_fifty.toString()),
      solarite.transfer(SOLARITE_LENDPool.address, two_fifty.toString()),
      solarite.transfer(SOLARITE_MKRPool.address, two_fifty.toString()),
      solarite.transfer(SOLARITE_SNXPool.address, two_fifty.toString()),
      solarite.transfer(SOLARITE_COMPPool.address, two_fifty.toString()),
      solarite.transfer(SOLARITE_LINKPool.address, two_fifty.toString()),
      solarite._setIncentivizer(SOLARITEIncentivizer.address),
    ]);

    await Promise.all([
      eth_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      ampl_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      yfi_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      lend_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      mkr_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      snx_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      comp_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      link_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),

      // incentives is a minter and prepopulates itself.
      ycrv_pool.methods.notifyRewardAmount("0").send({from: accounts[0], gas: 500000}),
    ]);

    await Promise.all([
      eth_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      ampl_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      yfi_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      lend_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      mkr_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      snx_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      comp_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      link_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      ycrv_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
    await Promise.all([
      eth_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      ampl_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      yfi_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      lend_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      mkr_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      snx_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      comp_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      link_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      ycrv_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
  }

  await Promise.all([
    solarite._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        SOLARITEProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        SOLARITEReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        SOLARITERebaser.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
