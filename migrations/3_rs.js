// ============ Contracts ============

// Token
// deployed first
const SOLARITEImplementation = artifacts.require("SOLARITEDelegate");
const SOLARITEProxy = artifacts.require("SOLARITEDelegator");

// Rs
// deployed second
const SOLARITEReserves = artifacts.require("SOLARITEReserves");
const SOLARITERebaser = artifacts.require("SOLARITERebaser");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployRs(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployRs(deployer, network) {
  let reserveToken = "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8";
  let uniswap_factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  await deployer.deploy(SOLARITEReserves, reserveToken, SOLARITEProxy.address);
  await deployer.deploy(SOLARITERebaser,
      SOLARITEProxy.address,
      reserveToken,
      uniswap_factory,
      SOLARITEReserves.address
  );
  let rebase = new web3.eth.Contract(SOLARITERebaser.abi, SOLARITERebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log(pair)
  let solarite = await SOLARITEProxy.deployed();
  await solarite._setRebaser(SOLARITERebaser.address);
  let reserves = await SOLARITEReserves.deployed();
  await reserves._setRebaser(SOLARITERebaser.address)
}
