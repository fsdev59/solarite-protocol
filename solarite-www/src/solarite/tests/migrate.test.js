import {
  Solarite
} from "../index.js";
import * as Types from "../lib/types.js";
import {
  addressMap
} from "../lib/constants.js";
import {
  decimalToString,
  stringToDecimal
} from "../lib/Helpers.js"


export const solarite = new Solarite(
  "http://localhost:8545/",
  // "http://127.0.0.1:9545/",
  "1001",
  true, {
    defaultAccount: "",
    defaultConfirmations: 1,
    autoGasMultiplier: 1.5,
    testing: false,
    defaultGas: "6000000",
    defaultGasPrice: "1000000000000",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("token_tests", () => {
  let snapshotId;
  let user = "0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84";
  let new_user;
  beforeAll(async () => {
    const accounts = await solarite.web3.eth.getAccounts();
    solarite.addAccount(accounts[0]);
    new_user = accounts[1];
    snapshotId = await solarite.testing.snapshot();
  });

  beforeEach(async () => {
    await solarite.testing.resetEVM("0x2");
  });

  // describe("expected fail", () => {
  //   test("before start", async () => {
  //     await solarite.testing.resetEVM("0x2");
  //     let startTime = await solarite.contracts.solariteV2migration.methods.startTime().call();
  //     let timeNow = solarite.toBigN((await solarite.web3.eth.getBlock('latest'))["timestamp"]);
  //     let waitTime = solarite.toBigN(startTime).minus(timeNow);
  //     if (waitTime <= 0) {
  //       // this test is hard to run on ganache as there is no easy way to
  //       // ensure that another test hasnt increased the time already
  //       console.log("WARNING: TEST CANNOT OCCUR DUE TO GANACHE TIMING");
  //     } else {
  //       await solarite.testing.expectThrow(solarite.contracts.solariteV2migration.methods.migrate().send({from: user}), "!started");
  //     }
  //   });
  //   test("user 0 balance", async () => {
  //     // fast forward to startTime
  //     let startTime = await solarite.contracts.solariteV2migration.methods.startTime().call();
  //     let timeNow = solarite.toBigN((await solarite.web3.eth.getBlock('latest'))["timestamp"]);
  //     let waitTime = solarite.toBigN(startTime).minus(timeNow);
  //     if (waitTime.toNumber() > 0) {
  //       await solarite.testing.increaseTime(waitTime.toNumber());
  //     }
  //     await solarite.testing.expectThrow(solarite.contracts.solariteV2migration.methods.migrate().send({from: new_user}), "No solarites");
  //   });
  //   test("after end", async () => {
  //     // increase time
  //     let startTime = await solarite.contracts.solariteV2migration.methods.startTime().call();
  //     let migrationDuration = await solarite.contracts.solariteV2migration.methods.migrationDuration().call();
  //     let timeNow = solarite.toBigN((await solarite.web3.eth.getBlock('latest'))["timestamp"]);
  //     let waitTime = solarite.toBigN(startTime).plus(solarite.toBigN(migrationDuration)).minus(timeNow);
  //     if (waitTime.toNumber() > 0) {
  //       await solarite.testing.increaseTime(waitTime.toNumber());
  //     }
  //     // expect fail
  //     await solarite.testing.expectThrow(solarite.contracts.solariteV2migration.methods.migrate().send({from: user}), "migration ended");
  //   });
  //   test("double migrate", async () => {
  //     await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
  //     await solarite.contracts.solariteV2migration.methods.migrate().send({from: user, gas: 1000000});
  //     let solarite_bal = solarite.toBigN(await solarite.contracts.solarite.methods.balanceOfUnderlying(user).call()).toNumber();
  //     await solarite.testing.expectThrow(solarite.contracts.solariteV2migration.methods.migrate().send({from: user, gas: 1000000}), "No solarites");
  //   });
  // });

  describe("non-failing", () => {
    test("zeros balance", async () => {
      let startTime = await solarite.contracts.solariteV2migration.methods.startTime().call();
      let timeNow = solarite.toBigN((await solarite.web3.eth.getBlock('latest'))["timestamp"]);
      let waitTime = solarite.toBigN(startTime).minus(timeNow);
      if (waitTime.toNumber() > 0) {
        await solarite.testing.increaseTime(waitTime.toNumber());
      }
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user, gas: 1000000});
      let solarite_bal = solarite.toBigN(await solarite.contracts.solarite.methods.balanceOf(user).call()).toNumber();
      expect(solarite_bal).toBe(0);
    });
    test("v2 balance equal to v1 underlying balance", async () => {
      let startTime = await solarite.contracts.solariteV2migration.methods.startTime().call();
      let timeNow = solarite.toBigN((await solarite.web3.eth.getBlock('latest'))["timestamp"]);
      let waitTime = solarite.toBigN(startTime).minus(timeNow);
      if (waitTime.toNumber() > 0) {
        await solarite.testing.increaseTime(waitTime.toNumber());
      }
      let solarite_bal = solarite.toBigN(await solarite.contracts.solarite.methods.balanceOfUnderlying(user).call());
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user, gas: 1000000});
      let solariteV2_bal = solarite.toBigN(await solarite.contracts.solariteV2.methods.balanceOf(user).call());
      expect(solarite_bal.toString()).toBe(solariteV2_bal.toString());
    });
    test("totalSupply increase equal to solarite_underlying_bal", async () => {
      let startTime = await solarite.contracts.solariteV2migration.methods.startTime().call();
      let timeNow = solarite.toBigN((await solarite.web3.eth.getBlock('latest'))["timestamp"]);
      let waitTime = solarite.toBigN(startTime).minus(timeNow);
      if (waitTime.toNumber() > 0) {
        await solarite.testing.increaseTime(waitTime.toNumber());
      }
      let solarite_underlying_bal = solarite.toBigN(await solarite.contracts.solarite.methods.balanceOfUnderlying(user).call());
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user, gas: 1000000});
      let solariteV2_ts = solarite.toBigN(await solarite.contracts.solariteV2.methods.totalSupply().call());
      expect(solariteV2_ts.toString()).toBe(solarite_underlying_bal.toString());
    });
  });
});
