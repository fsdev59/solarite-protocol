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
  let new_user;
  let user = "0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84";
  beforeAll(async () => {
    const accounts = await solarite.web3.eth.getAccounts();
    solarite.addAccount(accounts[0]);
    new_user = accounts[1];
    snapshotId = await solarite.testing.snapshot();
  });

  beforeEach(async () => {
    await solarite.testing.resetEVM("0x2");
  });

  describe("expected fail", () => {
    test("cant transfer from a 0 balance", async () => {
      await solarite.testing.expectThrow(solarite.contracts.solariteV2.methods.transfer(user, "100").send({from: new_user}), "ERC20: transfer amount exceeds balance");
    });
    test("cant transferFrom without allowance", async () => {
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user});
      await solarite.testing.expectThrow(solarite.contracts.solariteV2.methods.transferFrom(user, new_user, "100").send({from: new_user}), "ERC20: transfer amount exceeds allowance");
    });
    test("!minter", async () => {
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user});
      await solarite.testing.expectThrow(solarite.contracts.solariteV2.methods.mint(user, "100").send({from: user}), "!minter");
    });
    test("decreaseAllowance from 0", async () => {
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user});
      await solarite.testing.expectThrow(solarite.contracts.solariteV2.methods.decreaseAllowance(new_user, "100").send({from: user}), "ERC20: decreased allowance below zero");
    });
  });

  describe("non-failing", () => {
    test("name", async () => {
      let name = await solarite.contracts.solariteV2.methods.name().call();
      expect(name).toBe("SOLARITEv2");
    });
    test("symbol", async () => {
      let symbol = await solarite.contracts.solariteV2.methods.symbol().call();
      expect(symbol).toBe("SOLARITEv2");
    });
    test("decimals", async () => {
      let decimals = await solarite.contracts.solariteV2.methods.decimals().call();
      expect(decimals).toBe("24");
    });
    test("totalSupply", async () => {
      let ts = await solarite.contracts.solariteV2.methods.totalSupply().call();
      expect(ts).toBe("0");
    });
    test("transfer to self doesnt inflate", async () => {
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user});
      let bal0 = await solarite.contracts.solariteV2.methods.balanceOf(user).call();
      await solarite.contracts.solariteV2.methods.transfer(user, "100").send({from: user});
      let bal1 = await solarite.contracts.solariteV2.methods.balanceOf(user).call();
      expect(bal0).toBe(bal1);
    });
    test("transferFrom works", async () => {
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user});
      let bal00 = await solarite.contracts.solariteV2.methods.balanceOf(user).call();
      let bal01 = await solarite.contracts.solariteV2.methods.balanceOf(new_user).call();
      await solarite.contracts.solariteV2.methods.approve(new_user, "100").send({from: user});
      await solarite.contracts.solariteV2.methods.transferFrom(user, new_user, "100").send({from: new_user});
      let bal10 = await solarite.contracts.solariteV2.methods.balanceOf(user).call();
      let bal11 = await solarite.contracts.solariteV2.methods.balanceOf(new_user).call();
      expect((solarite.toBigN(bal01).plus(solarite.toBigN(100))).toString()).toBe(bal11);
      expect((solarite.toBigN(bal00).minus(solarite.toBigN(100))).toString()).toBe(bal10);
    });
    test("approve", async () => {
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user});
      await solarite.contracts.solariteV2.methods.approve(new_user, "100").send({from: user});
      let allowance = await solarite.contracts.solariteV2.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
    });
    test("increaseAllowance", async () => {
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user});
      await solarite.contracts.solariteV2.methods.increaseAllowance(new_user, "100").send({from: user});
      let allowance = await solarite.contracts.solariteV2.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
    });
    test("decreaseAllowance", async () => {
      await solarite.contracts.solarite.methods.approve(solarite.contracts.solariteV2migration.options.address, "10000000000000000000000000000000000").send({from: user, gas: 1000000});
      await solarite.contracts.solariteV2migration.methods.migrate().send({from: user});
      await solarite.contracts.solariteV2.methods.increaseAllowance(new_user, "100").send({from: user});
      let allowance = await solarite.contracts.solariteV2.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
      await solarite.contracts.solariteV2.methods.decreaseAllowance(new_user, "100").send({from: user});
      allowance = await solarite.contracts.solariteV2.methods.allowance(user, new_user).call();
      expect(allowance).toBe("0")
    });
  });
});
