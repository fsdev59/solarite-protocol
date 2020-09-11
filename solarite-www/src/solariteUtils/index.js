import {ethers} from 'ethers'

import BigNumber from 'bignumber.js'

import {PROPOSALSTATUSCODE} from '../solarite/lib/constants'

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
  //if (now >= 1597172400) {
  if (now >= 1599775200) {
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
  if (now >= 1599775200) {
    return poolContract.methods
      .withdraw((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas: 400000 })
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
  if (now >= 1599775200) {
    return poolContract.methods
      .getReward()
      .send({ from: account, gas: 800000 })
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
  if (now >= 1599775200) {
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
    .send({ from: account, gas: 160000 })
}

export const rebase = async (solarite, account) => {
  return solarite.contracts.rebaser.methods.rebase().send({ from: account })
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
  let starttime = solarite.toBigN(await solarite.contracts.ewtb_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let solaritesDistributed = solarite.toBigN(10 * timePassed * 5000 / 2592000); //solarites from first 8 pools
  let starttimePool2 = solarite.toBigN(await solarite.contracts.ycrvUNIV_pool.methods.starttime().call()).toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Solarites = solarite.toBigN(timePassed * 25000 / 2592000); // solarites from second pool. note: just accounts for first week
  let circulating = pool2Solarites.plus(solaritesDistributed).times(scalingFactor).div(10**36).toFixed(2)
  return circulating
}

export const getNextRebaseTimestamp = async (solarite) => {
  try {
    let now = await solarite.web3.eth.getBlock('latest').then(res => res.timestamp);
    let interval = 86400; // 24 hours
    let offset = 0; // 0AM utc
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
    return now + secondsToRebase
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


// gov
export const getProposals = async (solarite) => {
  let proposals = []
  const filter = {
    fromBlock: 0,
    toBlock: 'latest',
  }
  const events = await solarite.contracts.gov.getPastEvents("allEvents", filter)
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    let index = 0;
    if (event.removed === false) {
      switch (event.event) {
        case "ProposalCreated":
          proposals.push(
            {
              id: event.returnValues.id,
              proposer: event.returnValues.proposer,
              description: event.returnValues.description,
              startBlock: Number(event.returnValues.startBlock),
              endBlock: Number(event.returnValues.endBlock),
              targets: event.returnValues.targets,
              values: event.returnValues.values,
              signatures: event.returnValues.signatures,
              status: PROPOSALSTATUSCODE.CREATED,
              transactionHash: event.transactionHash
            }
          )
          break
        // TODO
        case "ProposalCanceled":
          index = proposals.findIndex((proposal) => proposal.id === event.returnValues.id)
          proposals[index].status = PROPOSALSTATUSCODE.CANCELED
          break
        case "ProposalQueued":
          index = proposals.findIndex((proposal) => proposal.id === event.returnValues.id)
          proposals[index].status = PROPOSALSTATUSCODE.QUEUED
          break
        case "VoteCast":
            break
        case "ProposalExecuted":
          break
        default:
          break
      }
    }
  }
  proposals.sort((a,b) => Number(b.endBlock) - Number(b.endBlock))
  return proposals
}

export const getProposal = async (solarite, id) => {
  const proposals = await getProposals(solarite)
  const proposal = proposals.find(p => p.id === id )
  return proposal
}

export const getProposalStatus = async (solarite, id) => {
  const proposalStatus = (await solarite.contracts.gov.methods.proposals(id).call())
  return proposalStatus
}

export const getQuorumVotes = async (solarite) => {
  return new BigNumber(await solarite.contracts.gov.methods.quorumVotes().call()).div(10**6)
}

export const getProposalThreshold = async (solarite) => {
  return new BigNumber(await solarite.contracts.gov.methods.proposalThreshold().call()).div(10**6)
}

export const getCurrentVotes = async (solarite, account) => {
  return solarite.toBigN(await solarite.contracts.solarite.methods.getCurrentVotes(account).call()).div(10**6)
}

export const delegate = async (solarite, account, from) => {
  return solarite.contracts.solarite.methods.delegate(account).send({from: from, gas: 640000 })
}

export const castVote = async (solarite, id, support, from) => {
  return solarite.contracts.gov.methods.castVote(id, support).send({from: from, gas: 640000 })
}
