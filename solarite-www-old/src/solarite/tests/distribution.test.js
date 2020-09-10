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
    defaultGasPrice: "1",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("Distribution", () => {
  let snapshotId;
  let user;
  let user2;
  let ycrv_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let weth_account = "0xf9e11762d522ea29dd78178c9baf83b7b093aacc";
  let uni_ampl_account = "0x8c545be506a335e24145edd6e01d2754296ff018";
  let comp_account = "0xc89b6f0146642688bb254bf93c28fccf1e182c81";
  let lend_account = "0x3b08aa814bea604917418a9f0907e7fc430e742c";
  let link_account = "0xbe6977e08d4479c0a6777539ae0e8fa27be4e9d6";
  let mkr_account = "0xf37216a8ac034d08b4663108d7532dfcb44583ed";
  let snx_account = "0xb696d629cd0a00560151a434f6b4478ad6c228d7"
  let yfi_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  beforeAll(async () => {
    const accounts = await solarite.web3.eth.getAccounts();
    solarite.addAccount(accounts[0]);
    user = accounts[0];
    solarite.addAccount(accounts[1]);
    user2 = accounts[1];
    snapshotId = await solarite.testing.snapshot();
  });

  beforeEach(async () => {
    await solarite.testing.resetEVM("0x2");
  });

  describe("pool failures", () => {
    test("cant join pool 1s early", async () => {
      await solarite.testing.resetEVM("0x2");
      let a = await solarite.web3.eth.getBlock('latest');

      let starttime = await solarite.contracts.eth_pool.methods.starttime().call();

      expect(solarite.toBigN(a["timestamp"]).toNumber()).toBeLessThan(solarite.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);
      await solarite.contracts.weth.methods.approve(solarite.contracts.eth_pool.options.address, -1).send({from: user});

      await solarite.testing.expectThrow(
        solarite.contracts.eth_pool.methods.stake(
          solarite.toBigN(200).times(solarite.toBigN(10**18)).toString()
        ).send({
          from: user,
          gas: 300000
        })
      , "not start");


      a = await solarite.web3.eth.getBlock('latest');

      starttime = await solarite.contracts.ampl_pool.methods.starttime().call();

      expect(solarite.toBigN(a["timestamp"]).toNumber()).toBeLessThan(solarite.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);

      await solarite.contracts.UNIAmpl.methods.approve(solarite.contracts.ampl_pool.options.address, -1).send({from: user});

      await solarite.testing.expectThrow(solarite.contracts.ampl_pool.methods.stake(
        "5016536322915819"
      ).send({
        from: user,
        gas: 300000
      }), "not start");
    });

    test("cant join pool 2 early", async () => {

    });

    test("cant withdraw more than deposited", async () => {
      await solarite.testing.resetEVM("0x2");
      let a = await solarite.web3.eth.getBlock('latest');

      await solarite.contracts.weth.methods.transfer(user, solarite.toBigN(2000).times(solarite.toBigN(10**18)).toString()).send({
        from: weth_account
      });
      await solarite.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
        from: uni_ampl_account
      });

      let starttime = await solarite.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await solarite.testing.increaseTime(waittime);
      }

      await solarite.contracts.weth.methods.approve(solarite.contracts.eth_pool.options.address, -1).send({from: user});

      await solarite.contracts.eth_pool.methods.stake(
        solarite.toBigN(200).times(solarite.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await solarite.contracts.UNIAmpl.methods.approve(solarite.contracts.ampl_pool.options.address, -1).send({from: user});

      await solarite.contracts.ampl_pool.methods.stake(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      await solarite.testing.expectThrow(solarite.contracts.ampl_pool.methods.withdraw(
        "5016536322915820"
      ).send({
        from: user,
        gas: 300000
      }), "");

      await solarite.testing.expectThrow(solarite.contracts.eth_pool.methods.withdraw(
        solarite.toBigN(201).times(solarite.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      }), "");

    });
  });

  describe("incentivizer pool", () => {
    test("joining and exiting", async() => {
      await solarite.testing.resetEVM("0x2");

      await solarite.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
        from: ycrv_account
      });

      await solarite.contracts.weth.methods.transfer(user, solarite.toBigN(2000).times(solarite.toBigN(10**18)).toString()).send({
        from: weth_account
      });

      let a = await solarite.web3.eth.getBlock('latest');

      let starttime = await solarite.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await solarite.testing.increaseTime(waittime);
      } else {
        console.log("late entry", waittime)
      }

      await solarite.contracts.weth.methods.approve(solarite.contracts.eth_pool.options.address, -1).send({from: user});

      await solarite.contracts.eth_pool.methods.stake(
        "2000000000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      let earned = await solarite.contracts.eth_pool.methods.earned(user).call();

      let rr = await solarite.contracts.eth_pool.methods.rewardRate().call();

      let rpt = await solarite.contracts.eth_pool.methods.rewardPerToken().call();
      //console.log(earned, rr, rpt);
      await solarite.testing.increaseTime(86400);
      // await solarite.testing.mineBlock();

      earned = await solarite.contracts.eth_pool.methods.earned(user).call();

      rpt = await solarite.contracts.eth_pool.methods.rewardPerToken().call();

      let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

      console.log(earned, ysf, rpt);

      let j = await solarite.contracts.eth_pool.methods.getReward().send({
        from: user,
        gas: 300000
      });

      let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

      console.log("solarite bal", solarite_bal)
      // start rebasing
        //console.log("approve solarite")
        await solarite.contracts.solarite.methods.approve(
          solarite.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });
        //console.log("approve ycrv")
        await solarite.contracts.ycrv.methods.approve(
          solarite.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });

        let ycrv_bal = await solarite.contracts.ycrv.methods.balanceOf(user).call()

        console.log("ycrv_bal bal", ycrv_bal)

        console.log("add liq/ create pool")
        await solarite.contracts.uni_router.methods.addLiquidity(
          solarite.contracts.solarite.options.address,
          solarite.contracts.ycrv.options.address,
          solarite_bal,
          solarite_bal,
          solarite_bal,
          solarite_bal,
          user,
          1596740361 + 10000000
        ).send({
          from: user,
          gas: 8000000
        });

        let pair = await solarite.contracts.uni_fact.methods.getPair(
          solarite.contracts.solarite.options.address,
          solarite.contracts.ycrv.options.address
        ).call();

        solarite.contracts.uni_pair.options.address = pair;
        let bal = await solarite.contracts.uni_pair.methods.balanceOf(user).call();

        await solarite.contracts.uni_pair.methods.approve(
          solarite.contracts.ycrv_pool.options.address,
          -1
        ).send({
          from: user,
          gas: 300000
        });

        starttime = await solarite.contracts.ycrv_pool.methods.starttime().call();

        a = await solarite.web3.eth.getBlock('latest');

        waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry, pool 2", waittime)
        }

        await solarite.contracts.ycrv_pool.methods.stake(bal).send({from: user, gas: 400000});


        earned = await solarite.contracts.ampl_pool.methods.earned(user).call();

        rr = await solarite.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await solarite.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await solarite.testing.increaseTime(625000 + 1000);

        earned = await solarite.contracts.ampl_pool.methods.earned(user).call();

        rr = await solarite.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await solarite.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await solarite.contracts.ycrv_pool.methods.exit().send({from: user, gas: 400000});

        solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call();


        expect(solarite.toBigN(solarite_bal).toNumber()).toBeGreaterThan(0)
        console.log("solarite bal after staking in pool 2", solarite_bal);
    });
  });

  describe("ampl", () => {
    test("rewards from pool 1s ampl", async () => {
        await solarite.testing.resetEVM("0x2");

        await solarite.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
          from: uni_ampl_account
        });
        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          //console.log("missed entry");
        }

        await solarite.contracts.UNIAmpl.methods.approve(solarite.contracts.ampl_pool.options.address, -1).send({from: user});

        await solarite.contracts.ampl_pool.methods.stake(
          "5000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.ampl_pool.methods.earned(user).call();

        let rr = await solarite.contracts.ampl_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.ampl_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(625000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.ampl_pool.methods.earned(user).call();

        rpt = await solarite.contracts.ampl_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let j = await solarite.contracts.ampl_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        // let k = await solarite.contracts.eth_pool.methods.exit().send({
        //   from: user,
        //   gas: 300000
        // });
        //
        // //console.log(k.events)

        // weth_bal = await solarite.contracts.weth.methods.balanceOf(user).call()

        // expect(weth_bal).toBe(solarite.toBigN(2000).times(solarite.toBigN(10**18)).toString())

        let ampl_bal = await solarite.contracts.UNIAmpl.methods.balanceOf(user).call()

        expect(ampl_bal).toBe("5000000000000000")


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("eth", () => {
    test("rewards from pool 1s eth", async () => {
        await solarite.testing.resetEVM("0x2");

        await solarite.contracts.weth.methods.transfer(user, solarite.toBigN(2000).times(solarite.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await solarite.contracts.weth.methods.approve(solarite.contracts.eth_pool.options.address, -1).send({from: user});

        await solarite.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.eth_pool.methods.earned(user).call();

        let rr = await solarite.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(625000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.eth_pool.methods.earned(user).call();

        rpt = await solarite.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let j = await solarite.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await solarite.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toString()).toBe(two_fity.times(1).toString())
    });
    test("rewards from pool 1s eth with rebase", async () => {
        await solarite.testing.resetEVM("0x2");

        await solarite.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await solarite.contracts.weth.methods.transfer(user, solarite.toBigN(2000).times(solarite.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await solarite.contracts.weth.methods.approve(solarite.contracts.eth_pool.options.address, -1).send({from: user});

        await solarite.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.eth_pool.methods.earned(user).call();

        let rr = await solarite.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(125000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.eth_pool.methods.earned(user).call();

        rpt = await solarite.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await solarite.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        console.log("solarite bal", solarite_bal)
        // start rebasing
          //console.log("approve solarite")
          await solarite.contracts.solarite.methods.approve(
            solarite.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await solarite.contracts.ycrv.methods.approve(
            solarite.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await solarite.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          console.log("add liq/ create pool")
          await solarite.contracts.uni_router.methods.addLiquidity(
            solarite.contracts.solarite.options.address,
            solarite.contracts.ycrv.options.address,
            solarite_bal,
            solarite_bal,
            solarite_bal,
            solarite_bal,
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await solarite.contracts.uni_fact.methods.getPair(
            solarite.contracts.solarite.options.address,
            solarite.contracts.ycrv.options.address
          ).call();

          solarite.contracts.uni_pair.options.address = pair;
          let bal = await solarite.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await solarite.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000000000000",
            100000,
            [
              solarite.contracts.ycrv.options.address,
              solarite.contracts.solarite.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await solarite.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000",
            100000,
            [
              solarite.contracts.ycrv.options.address,
              solarite.contracts.solarite.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await solarite.testing.increaseTime(43200);

          //console.log("init twap")
          await solarite.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await solarite.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              solarite.contracts.ycrv.options.address,
              solarite.contracts.solarite.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await solarite.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await solarite.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await solarite.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000000",
            100000,
            [
              solarite.contracts.ycrv.options.address,
              solarite.contracts.solarite.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await solarite.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await solarite.contracts.solarite.methods.balanceOf(user).call();

          a = await solarite.web3.eth.getBlock('latest');

          let offset = await solarite.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = solarite.toBigN(offset).toNumber();
          let interval = await solarite.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = solarite.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await solarite.testing.increaseTime(i);

          let r = await solarite.contracts.uni_pair.methods.getReserves().call();
          let q = await solarite.contracts.uni_router.methods.quote(solarite.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await solarite.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await solarite.contracts.solarite.methods.balanceOf(user).call();

          let resSOLARITE = await solarite.contracts.solarite.methods.balanceOf(solarite.contracts.reserves.options.address).call();

          let resycrv = await solarite.contracts.ycrv.methods.balanceOf(solarite.contracts.reserves.options.address).call();

          // new balance > old balance
          expect(solarite.toBigN(bal).toNumber()).toBeLessThan(solarite.toBigN(bal1).toNumber());
          // increases reserves
          expect(solarite.toBigN(resycrv).toNumber()).toBeGreaterThan(0);

          r = await solarite.contracts.uni_pair.methods.getReserves().call();
          q = await solarite.contracts.uni_router.methods.quote(solarite.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(solarite.toBigN(q).toNumber()).toBeGreaterThan(solarite.toBigN(10**18).toNumber());


        await solarite.testing.increaseTime(525000 + 100);


        j = await solarite.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await solarite.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(
          solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toNumber()
        ).toBeGreaterThan(two_fity.toNumber())
    });
    test("rewards from pool 1s eth with negative rebase", async () => {
        await solarite.testing.resetEVM("0x2");

        await solarite.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await solarite.contracts.weth.methods.transfer(user, solarite.toBigN(2000).times(solarite.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await solarite.contracts.weth.methods.approve(solarite.contracts.eth_pool.options.address, -1).send({from: user});

        await solarite.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.eth_pool.methods.earned(user).call();

        let rr = await solarite.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(125000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.eth_pool.methods.earned(user).call();

        rpt = await solarite.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await solarite.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        console.log("solarite bal", solarite_bal)
        // start rebasing
          //console.log("approve solarite")
          await solarite.contracts.solarite.methods.approve(
            solarite.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await solarite.contracts.ycrv.methods.approve(
            solarite.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await solarite.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          solarite_bal = solarite.toBigN(solarite_bal);
          console.log("add liq/ create pool")
          await solarite.contracts.uni_router.methods.addLiquidity(
            solarite.contracts.solarite.options.address,
            solarite.contracts.ycrv.options.address,
            solarite_bal.times(.1).toString(),
            solarite_bal.times(.1).toString(),
            solarite_bal.times(.1).toString(),
            solarite_bal.times(.1).toString(),
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await solarite.contracts.uni_fact.methods.getPair(
            solarite.contracts.solarite.options.address,
            solarite.contracts.ycrv.options.address
          ).call();

          solarite.contracts.uni_pair.options.address = pair;
          let bal = await solarite.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await solarite.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              solarite.contracts.solarite.options.address,
              solarite.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await solarite.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              solarite.contracts.solarite.options.address,
              solarite.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await solarite.testing.increaseTime(43200);

          //console.log("init twap")
          await solarite.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await solarite.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              solarite.contracts.solarite.options.address,
              solarite.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await solarite.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await solarite.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await solarite.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000",
            100000,
            [
              solarite.contracts.solarite.options.address,
              solarite.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await solarite.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await solarite.contracts.solarite.methods.balanceOf(user).call();

          a = await solarite.web3.eth.getBlock('latest');

          let offset = await solarite.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = solarite.toBigN(offset).toNumber();
          let interval = await solarite.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = solarite.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await solarite.testing.increaseTime(i);

          let r = await solarite.contracts.uni_pair.methods.getReserves().call();
          let q = await solarite.contracts.uni_router.methods.quote(solarite.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await solarite.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await solarite.contracts.solarite.methods.balanceOf(user).call();

          let resSOLARITE = await solarite.contracts.solarite.methods.balanceOf(solarite.contracts.reserves.options.address).call();

          let resycrv = await solarite.contracts.ycrv.methods.balanceOf(solarite.contracts.reserves.options.address).call();

          expect(solarite.toBigN(bal1).toNumber()).toBeLessThan(solarite.toBigN(bal).toNumber());
          expect(solarite.toBigN(resycrv).toNumber()).toBe(0);

          r = await solarite.contracts.uni_pair.methods.getReserves().call();
          q = await solarite.contracts.uni_router.methods.quote(solarite.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(solarite.toBigN(q).toNumber()).toBeLessThan(solarite.toBigN(10**18).toNumber());


        await solarite.testing.increaseTime(525000 + 100);


        j = await solarite.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await solarite.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(
          solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toNumber()
        ).toBeLessThan(two_fity.toNumber())
    });
  });

  describe("yfi", () => {
    test("rewards from pool 1s yfi", async () => {
        await solarite.testing.resetEVM("0x2");
        await solarite.contracts.yfi.methods.transfer(user, "500000000000000000000").send({
          from: yfi_account
        });

        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.yfi_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await solarite.contracts.yfi.methods.approve(solarite.contracts.yfi_pool.options.address, -1).send({from: user});

        await solarite.contracts.yfi_pool.methods.stake(
          "500000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.yfi_pool.methods.earned(user).call();

        let rr = await solarite.contracts.yfi_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.yfi_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(625000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.yfi_pool.methods.earned(user).call();

        rpt = await solarite.contracts.yfi_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let j = await solarite.contracts.yfi_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await solarite.contracts.yfi.methods.balanceOf(user).call()

        expect(weth_bal).toBe("500000000000000000000")


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("comp", () => {
    test("rewards from pool 1s comp", async () => {
        await solarite.testing.resetEVM("0x2");
        await solarite.contracts.comp.methods.transfer(user, "50000000000000000000000").send({
          from: comp_account
        });

        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.comp_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await solarite.contracts.comp.methods.approve(solarite.contracts.comp_pool.options.address, -1).send({from: user});

        await solarite.contracts.comp_pool.methods.stake(
          "50000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.comp_pool.methods.earned(user).call();

        let rr = await solarite.contracts.comp_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.comp_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(625000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.comp_pool.methods.earned(user).call();

        rpt = await solarite.contracts.comp_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let j = await solarite.contracts.comp_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await solarite.contracts.comp.methods.balanceOf(user).call()

        expect(weth_bal).toBe("50000000000000000000000")


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("lend", () => {
    test("rewards from pool 1s lend", async () => {
        await solarite.testing.resetEVM("0x2");
        await solarite.web3.eth.sendTransaction({from: user2, to: lend_account, value : solarite.toBigN(100000*10**18).toString()});

        await solarite.contracts.lend.methods.transfer(user, "10000000000000000000000000").send({
          from: lend_account
        });

        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.lend_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await solarite.contracts.lend.methods.approve(solarite.contracts.lend_pool.options.address, -1).send({from: user});

        await solarite.contracts.lend_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.lend_pool.methods.earned(user).call();

        let rr = await solarite.contracts.lend_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.lend_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(625000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.lend_pool.methods.earned(user).call();

        rpt = await solarite.contracts.lend_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let j = await solarite.contracts.lend_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await solarite.contracts.lend.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("link", () => {
    test("rewards from pool 1s link", async () => {
        await solarite.testing.resetEVM("0x2");

        await solarite.web3.eth.sendTransaction({from: user2, to: link_account, value : solarite.toBigN(100000*10**18).toString()});

        await solarite.contracts.link.methods.transfer(user, "10000000000000000000000000").send({
          from: link_account
        });

        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.link_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await solarite.contracts.link.methods.approve(solarite.contracts.link_pool.options.address, -1).send({from: user});

        await solarite.contracts.link_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.link_pool.methods.earned(user).call();

        let rr = await solarite.contracts.link_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.link_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(625000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.link_pool.methods.earned(user).call();

        rpt = await solarite.contracts.link_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let j = await solarite.contracts.link_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await solarite.contracts.link.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("mkr", () => {
    test("rewards from pool 1s mkr", async () => {
        await solarite.testing.resetEVM("0x2");
        await solarite.web3.eth.sendTransaction({from: user2, to: mkr_account, value : solarite.toBigN(100000*10**18).toString()});
        let eth_bal = await solarite.web3.eth.getBalance(mkr_account);

        await solarite.contracts.mkr.methods.transfer(user, "10000000000000000000000").send({
          from: mkr_account
        });

        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.mkr_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await solarite.contracts.mkr.methods.approve(solarite.contracts.mkr_pool.options.address, -1).send({from: user});

        await solarite.contracts.mkr_pool.methods.stake(
          "10000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.mkr_pool.methods.earned(user).call();

        let rr = await solarite.contracts.mkr_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.mkr_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(625000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.mkr_pool.methods.earned(user).call();

        rpt = await solarite.contracts.mkr_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let j = await solarite.contracts.mkr_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await solarite.contracts.mkr.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000")


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("snx", () => {
    test("rewards from pool 1s snx", async () => {
        await solarite.testing.resetEVM("0x2");

        await solarite.web3.eth.sendTransaction({from: user2, to: snx_account, value : solarite.toBigN(100000*10**18).toString()});

        let snx_bal = await solarite.contracts.snx.methods.balanceOf(snx_account).call();

        console.log(snx_bal)

        await solarite.contracts.snx.methods.transfer(user, snx_bal).send({
          from: snx_account
        });

        snx_bal = await solarite.contracts.snx.methods.balanceOf(user).call();

        console.log(snx_bal)

        let a = await solarite.web3.eth.getBlock('latest');

        let starttime = await solarite.contracts.snx_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await solarite.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await solarite.contracts.snx.methods.approve(solarite.contracts.snx_pool.options.address, -1).send({from: user});

        await solarite.contracts.snx_pool.methods.stake(
          snx_bal
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await solarite.contracts.snx_pool.methods.earned(user).call();

        let rr = await solarite.contracts.snx_pool.methods.rewardRate().call();

        let rpt = await solarite.contracts.snx_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await solarite.testing.increaseTime(625000 + 100);
        // await solarite.testing.mineBlock();

        earned = await solarite.contracts.snx_pool.methods.earned(user).call();

        rpt = await solarite.contracts.snx_pool.methods.rewardPerToken().call();

        let ysf = await solarite.contracts.solarite.methods.solaritesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let solarite_bal = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let j = await solarite.contracts.snx_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await solarite.contracts.snx.methods.balanceOf(user).call()

        expect(weth_bal).toBe(snx_bal)


        let solarite_bal2 = await solarite.contracts.solarite.methods.balanceOf(user).call()

        let two_fity = solarite.toBigN(250).times(solarite.toBigN(10**3)).times(solarite.toBigN(10**18))
        expect(solarite.toBigN(solarite_bal2).minus(solarite.toBigN(solarite_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });
})
