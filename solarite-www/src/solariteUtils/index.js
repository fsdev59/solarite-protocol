import {ethers} from 'ethers'

import BigNumber from 'bignumber.js'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  }
};

export const getPoolStartTime = async (poolContract) => {
  return await poolContract.methods.starttime().call()
}

export const stake = async (poolContract, amount, account, tokenName) => {
  let now = new Date().getTime() / 1000;
  const gas = GAS_LIMIT.STAKING[tokenName.toUpperCase()] || GAS_LIMIT.STAKING.DEFAULT;
  if (now >= 1597172400) {
    return poolContract.methods
      .stake((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const unstake = async (poolContract, amount, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .withdraw((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const harvest = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .getReward()
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const redeem = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .exit()
      .send({ from: account, gas: 400000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const approve = async (tokenContract, poolContract, account) => {
  return tokenContract.methods
    .approve(poolContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account, gas: 80000 })
}

export const getPoolContracts = async (solarite) => {
  const pools = Object.keys(solarite.contracts)
    .filter(c => c.indexOf('_pool') !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc }
      newAcc[cur] = solarite.contracts[cur]
      return newAcc
    }, {})
  return pools
}

export const getEarned = async (solarite, pool, account) => {
  const scalingFactor = new BigNumber(await solarite.contracts.solarite.methods.solaritesScalingFactor().call())
  const earned = new BigNumber(await pool.methods.earned(account).call())
  return earned.multipliedBy(scalingFactor.dividedBy(new BigNumber(10).pow(18)))
}

export const getStaked = async (solarite, pool, account) => {
  return solarite.toBigN(await pool.methods.balanceOf(account).call())
}

export const getCurrentPrice = async (solarite) => {
  // FORBROCK: get current SOLARITE price
  return solarite.toBigN(await solarite.contracts.rebaser.methods.getCurrentTWAP().call())
}

export const getTargetPrice = async (solarite) => {
  return solarite.toBigN(1).toFixed(2);
}

export const getCirculatingSupply = async (solarite) => {
  let now = await solarite.web3.eth.getBlock('latest');
  let scalingFactor = solarite.toBigN(await solarite.contracts.solarite.methods.solaritesScalingFactor().call());
  let starttime = solarite.toBigN(await solarite.contracts.eth_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let solaritesDistributed = solarite.toBigN(8 * timePassed * 250000 / 625000); //solarites from first 8 pools
  let starttimePool2 = solarite.toBigN(await solarite.contracts.ycrv_pool.methods.starttime().call()).toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Solarites = solarite.toBigN(timePassed * 1500000 / 625000); // solarites from second pool. note: just accounts for first week
  let circulating = pool2Solarites.plus(solaritesDistributed).times(scalingFactor).div(10**36).toFixed(2)
  return circulating
}

export const getNextRebaseTimestamp = async (solarite) => {
  try {
    let now = await solarite.web3.eth.getBlock('latest').then(res => res.timestamp);
    let interval = 43200; // 12 hours
    let offset = 28800; // 8am/8pm utc
    let secondsToRebase = 0;
    if (await solarite.contracts.rebaser.methods.rebasingActive().call()) {
      if (now % interval > offset) {
          secondsToRebase = (interval - (now % interval)) + offset;
       } else {
          secondsToRebase = offset - (now % interval);
      }
    } else {
      let twap_init = solarite.toBigN(await solarite.contracts.rebaser.methods.timeOfTWAPInit().call()).toNumber();
      if (twap_init > 0) {
        let delay = solarite.toBigN(await solarite.contracts.rebaser.methods.rebaseDelay().call()).toNumber();
        let endTime = twap_init + delay;
        if (endTime % interval > offset) {
            secondsToRebase = (interval - (endTime % interval)) + offset;
         } else {
            secondsToRebase = offset - (endTime % interval);
        }
        return endTime + secondsToRebase;
      } else {
        return now + 13*60*60; // just know that its greater than 12 hours away
      }
    }
    return secondsToRebase
  } catch (e) {
    console.log(e)
  }
}

export const getTotalSupply = async (solarite) => {
  return await solarite.contracts.solarite.methods.totalSupply().call();
}

export const getStats = async (solarite) => {
  const curPrice = await getCurrentPrice(solarite)
  const circSupply = await getCirculatingSupply(solarite)
  const nextRebase = await getNextRebaseTimestamp(solarite)
  const targetPrice = await getTargetPrice(solarite)
  const totalSupply = await getTotalSupply(solarite)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}

export const vote = async (solarite, account) => {
  return solarite.contracts.gov.methods.castVote(0, true).send({ from: account })
}

export const delegate = async (solarite, account) => {
  return solarite.contracts.solarite.methods.delegate("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").send({from: account, gas: 320000 })
}

export const didDelegate = async (solarite, account) => {
  return await solarite.contracts.solarite.methods.delegates(account).call() === '0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84'
}

export const getVotes = async (solarite) => {
  const votesRaw = new BigNumber(await solarite.contracts.solarite.methods.getCurrentVotes("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").call()).div(10**24)
  return votesRaw
}

export const getScalingFactor = async (solarite) => {
  return new BigNumber(await solarite.contracts.solarite.methods.solaritesScalingFactor().call())
}

export const getDelegatedBalance = async (solarite, account) => {
  return new BigNumber(await solarite.contracts.solarite.methods.balanceOfUnderlying(account).call()).div(10**24)
}

export const migrate = async (solarite, account) => {
  return solarite.contracts.solariteV2migration.methods.migrate().send({ from: account, gas: 320000 })
}

export const getMigrationEndTime = async (solarite) => {
  return solarite.toBigN(await solarite.contracts.solariteV2migration.methods.startTime().call()).plus(solarite.toBigN(86400*3)).toNumber()
}

export const getV2Supply = async (solarite) => {
  return new BigNumber(await solarite.contracts.solariteV2.methods.totalSupply().call())
}