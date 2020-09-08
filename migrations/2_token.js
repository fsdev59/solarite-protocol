// ============ Contracts ============

// Token
// deployed first
const SOLARITEImplementation = artifacts.require("SOLARITEDelegate");
const SOLARITEProxy = artifacts.require("SOLARITEDelegator");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
  await deployer.deploy(SOLARITEImplementation);
  if (network != "mainnet") {
    await deployer.deploy(SOLARITEProxy,
      "SOLARITE",
      "SOLARITE",
      18,
      "200000000000000000000000", // print extra few mil for user
      SOLARITEImplementation.address,
      "0x"
    );
  } else {
    await deployer.deploy(SOLARITEProxy,
      "SOLARITE",
      "SOLARITE",
      18,
      "50000000000000000000000",
      SOLARITEImplementation.address,
      "0x"
    );
  }
}
