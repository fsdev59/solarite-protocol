import BigNumber from 'bignumber.js/bignumber';
import Web3 from 'web3';
import * as Types from "./types.js";
import { SUBTRACT_GAS_LIMIT, addressMap } from './constants.js';

import ERC20Json from '../clean_build/contracts/IERC20.json';
import SOLARITEJson from '../clean_build/contracts/SOLARITEDelegator.json';
import SOLARITERebaserJson from '../clean_build/contracts/SOLARITERebaser.json';
import SOLARITEReservesJson from '../clean_build/contracts/SOLARITEReserves.json';
import SOLARITEGovJson from '../clean_build/contracts/GovernorAlpha.json';
import SOLARITETimelockJson from '../clean_build/contracts/Timelock.json';
import WETHJson from './weth.json';
import CRVJson from './crv.json';
import UNIFactJson from './unifact2.json';
import UNIPairJson from './uni2.json';
import UNIRouterJson from './uniR.json';

// basic pool
import WETHPoolJson from '../clean_build/contracts/SOLARITEETHPool.json';
import YAMPoolJson from '../clean_build/contracts/SOLARITEYAMPool.json';
import YFIPoolJson from '../clean_build/contracts/SOLARITEYFIPool.json';
import YFIIPoolJson from '../clean_build/contracts/SOLARITEYFIIPool.json';
import MKRPoolJson from '../clean_build/contracts/SOLARITEMKRPool.json';
import LENDPoolJson from '../clean_build/contracts/SOLARITELENDPool.json';
import COMPPoolJson from '../clean_build/contracts/SOLARITECOMPPool.json';
import CRVPoolJson from '../clean_build/contracts/SOLARITECRVPool.json';
import LINKPoolJson from '../clean_build/contracts/SOLARITELINKPool.json';
import SNXPoolJson from '../clean_build/contracts/SOLARITESNXPool.json';

import WBTCPoolJson from '../clean_build/contracts/SOLARITEBTCPool.json';
import YALINKPoolJson from '../clean_build/contracts/SOLARITEYALINKPool.json';

import BASEDPoolJson from '../clean_build/contracts/SOLARITEBASEDPool.json';
import ETHPYLONLPPoolJson from '../clean_build/contracts/SOLARITEETHPYLONLPPool.json';
import EWTBPoolJson from '../clean_build/contracts/SOLARITEEWTBPool.json';
import PYLONPoolJson from '../clean_build/contracts/SOLARITEPYLONPool.json';
import YCRVPYLONLPPoolJson from '../clean_build/contracts/SOLARITEYCRVPYLONLPPool.json';
import ZOMBIEPoolJson from '../clean_build/contracts/SOLARITEZOMBIEPool.json';
import PYLONLPPoolJson from '../clean_build/contracts/SOLARITEPYLONLPPool.json';

// uniswap pool
import IncJson from '../clean_build/contracts/SOLARITEIncentivizer.json';

export class Contracts {
  constructor(
    provider,
    networkId,
    web3,
    options
  ) {
    this.web3 = web3;
    this.defaultConfirmations = options.defaultConfirmations;
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5;
    this.confirmationType = options.confirmationType || Types.ConfirmationType.Confirmed;
    this.defaultGas = options.defaultGas;
    this.defaultGasPrice = options.defaultGasPrice;

    this.uni_pair = new this.web3.eth.Contract(UNIPairJson);
    this.uni_router = new this.web3.eth.Contract(UNIRouterJson);
    this.uni_fact = new this.web3.eth.Contract(UNIFactJson);

    //this.eth_pool = new this.web3.eth.Contract(WETHPoolJson.abi);
    // this.weth_pool = this.eth_pool;
    // this.yfi_pool = new this.web3.eth.Contract(YFIPoolJson.abi);
    // this.yfii_pool = new this.web3.eth.Contract(YFIIPoolJson.abi);
    // this.yam_pool = new this.web3.eth.Contract(YAMPoolJson.abi);
    // this.crv_pool = new this.web3.eth.Contract(CRVPoolJson.abi);
    //this.comp_pool = new this.web3.eth.Contract(COMPPoolJson.abi);
    this.link_pool = new this.web3.eth.Contract(LINKPoolJson.abi);
    this.lend_pool = new this.web3.eth.Contract(LENDPoolJson.abi);
    // this.mkr_pool = new this.web3.eth.Contract(MKRPoolJson.abi);
    this.snx_pool = new this.web3.eth.Contract(SNXPoolJson.abi);
    this.based_pool = new this.web3.eth.Contract(BASEDPoolJson.abi);
    this.ethpylonlp_pool = new this.web3.eth.Contract(ETHPYLONLPPoolJson.abi);
    this.ewtb_pool = new this.web3.eth.Contract(EWTBPoolJson.abi);
    this.pylon_pool = new this.web3.eth.Contract(PYLONPoolJson.abi);
    this.ycrvpylonlp_pool = new this.web3.eth.Contract(YCRVPYLONLPPoolJson.abi);
    // this.zombie_pool = new this.web3.eth.Contract(ZOMBIEPoolJson.abi);
    this.pylonlp_pool = new this.web3.eth.Contract(PYLONLPPoolJson.abi);

    // new
    //this.btc_pool = new this.web3.eth.Contract(WBTCPoolJson.abi);
    //this.yalink_pool = new this.web3.eth.Contract(YALINKPoolJson.abi);

    this.ycrvUNIV_pool = new this.web3.eth.Contract(IncJson.abi);
    this.uni_lp_pool = this.ycrvUNIV_pool;

    this.yfi = new this.web3.eth.Contract(ERC20Json.abi);
    this.yam = new this.web3.eth.Contract(ERC20Json.abi);
    this.crv = new this.web3.eth.Contract(ERC20Json.abi);
    this.solarite = new this.web3.eth.Contract(SOLARITEJson.abi);
    this.comp = new this.web3.eth.Contract(ERC20Json.abi);
    this.yam = new this.web3.eth.Contract(ERC20Json.abi);
    this.link = new this.web3.eth.Contract(ERC20Json.abi);
    this.lend = new this.web3.eth.Contract(ERC20Json.abi);
    this.mkr = new this.web3.eth.Contract(ERC20Json.abi);
    this.yfii = new this.web3.eth.Contract(ERC20Json.abi);
    this.snx = new this.web3.eth.Contract(ERC20Json.abi);
    this.ycrv = new this.web3.eth.Contract(ERC20Json.abi);
    this.erc20 = new this.web3.eth.Contract(ERC20Json.abi);
    this.based = new this.web3.eth.Contract(ERC20Json.abi);
    this.ethpylonlp = new this.web3.eth.Contract(ERC20Json.abi);
    this.ewtb = new this.web3.eth.Contract(ERC20Json.abi);
    this.pylon = new this.web3.eth.Contract(ERC20Json.abi);
    this.ycrvpylonlp = new this.web3.eth.Contract(ERC20Json.abi);
    // this.zombie = new this.web3.eth.Contract(ERC20Json.abi);
    this.pylonlp = new this.web3.eth.Contract(ERC20Json.abi);

    // new 
    this.btc = new this.web3.eth.Contract(ERC20Json.abi);
    this.yalink = new this.web3.eth.Contract(ERC20Json.abi);

    this.ycrvUNIV = new this.web3.eth.Contract(ERC20Json.abi);
    this.uni_lp = this.ycrvUNIV;

    this.rebaser = new this.web3.eth.Contract(SOLARITERebaserJson.abi);
    this.reserves = new this.web3.eth.Contract(SOLARITEReservesJson.abi);
    this.gov = new this.web3.eth.Contract(SOLARITEGovJson.abi);
    this.timelock = new this.web3.eth.Contract(SOLARITETimelockJson.abi);
    this.weth = new this.web3.eth.Contract(WETHJson);
    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount);
  }


  setProvider(
    provider,
    networkId
  ) {
    this.solarite.setProvider(provider);
    this.rebaser.setProvider(provider);
    this.reserves.setProvider(provider);
    this.gov.setProvider(provider);
    this.timelock.setProvider(provider);
    const contracts = [
      { contract: this.solarite, json: SOLARITEJson },
      { contract: this.rebaser, json: SOLARITERebaserJson },
      { contract: this.reserves, json: SOLARITEReservesJson },
      { contract: this.gov, json: SOLARITEGovJson },
      { contract: this.timelock, json: SOLARITETimelockJson },
      // { contract: this.eth_pool, json: WETHPoolJson },
      // { contract: this.yfi_pool, json: YFIPoolJson },
      // { contract: this.yfii_pool, json: YFIIPoolJson },
      // { contract: this.yam_pool, json: YAMPoolJson },
      // { contract: this.crv_pool, json: CRVPoolJson },
      // { contract: this.mkr_pool, json: MKRPoolJson },
      { contract: this.snx_pool, json: SNXPoolJson },
      { contract: this.lend_pool, json: LENDPoolJson },
      { contract: this.link_pool, json: LINKPoolJson },
      { contract: this.based_pool, json: BASEDPoolJson },
      { contract: this.ethpylonlp_pool, json: ETHPYLONLPPoolJson },
      { contract: this.ewtb_pool, json: EWTBPoolJson },
      { contract: this.pylon_pool, json: PYLONPoolJson },
      { contract: this.ycrvpylonlp_pool, json: YCRVPYLONLPPoolJson },
      // { contract: this.zombie_pool, json: ZOMBIEPoolJson },
      { contract: this.pylonlp_pool, json: PYLONLPPoolJson },
      // { contract: this.comp_pool, json: COMPPoolJson },
      
      // { contract: this.yalink_pool, json: YALINKPoolJson },
      // { contract: this.btc_pool, json: WBTCPoolJson },

      { contract: this.ycrvUNIV_pool, json: IncJson },
    ]

    contracts.forEach(contract => this.setContractProvider(
        contract.contract,
        contract.json,
        provider,
        networkId,
      ),
    );
    this.yfi.options.address = addressMap["YFI"];
    this.yfii.options.address = addressMap["YFII"];
    this.crv.options.address = addressMap["CRV"];
    this.yam.options.address = addressMap["YAM"];
    this.weth.options.address = addressMap["WETH"];
    this.comp.options.address = addressMap["COMP"];
    this.link.options.address = addressMap["LINK"];
    this.lend.options.address = addressMap["LEND"];
    this.mkr.options.address = addressMap["MKR"];
    this.snx.options.address = addressMap["SNX"];

    this.yalink.options.address = addressMap["YALINK"];
    this.btc.options.address = addressMap["WBTC"];

    this.based.options.address = addressMap["BASED"];
    this.ethpylonlp.options.address = addressMap["ETHPYLONLP"];
    this.ewtb.options.address = addressMap["EWTB"];
    this.pylon.options.address = addressMap["PYLON"];
    this.ycrvpylonlp.options.address = addressMap["YCRVPYLONLP"];
    // this.zombie.options.address = addressMap["ZOMBIE"];
    this.pylonlp.options.address = addressMap["PYLONLP"];

    this.ycrv.options.address = addressMap["YCRV"];
    this.ycrvUNIV.options.address = addressMap["YCRVUNIV"];
    this.uni_fact.options.address = addressMap["uniswapFactoryV2"];
    this.uni_router.options.address = addressMap["UNIRouter"];

    this.pools = [
      // {"tokenAddr": this.yam.options.address, "poolAddr": this.yam_pool.options.address},
      // {"tokenAddr": this.weth.options.address, "poolAddr": this.eth_pool.options.address},
      // {"tokenAddr": this.yfi.options.address, "poolAddr": this.yfi_pool.options.address},
      // {"tokenAddr": this.yfii.options.address, "poolAddr": this.yfii_pool.options.address},
      // {"tokenAddr": this.crv.options.address, "poolAddr": this.crv_pool.options.address},
      // {"tokenAddr": this.comp.options.address, "poolAddr": this.comp_pool.options.address},
      {"tokenAddr": this.link.options.address, "poolAddr": this.link_pool.options.address},
      {"tokenAddr": this.lend.options.address, "poolAddr": this.lend_pool.options.address},
      // {"tokenAddr": this.mkr.options.address, "poolAddr": this.mkr_pool.options.address},
      {"tokenAddr": this.snx.options.address, "poolAddr": this.snx_pool.options.address},
      {"tokenAddr": this.ycrvUNIV.options.address, "poolAddr": this.ycrvUNIV_pool.options.address},
    
      {"tokenAddr": this.based.options.address, "poolAddr": this.based_pool.options.address},
      {"tokenAddr": this.ethpylonlp.options.address, "poolAddr": this.ethpylonlp_pool.options.address},
      {"tokenAddr": this.ewtb.options.address, "poolAddr": this.ewtb_pool.options.address},
      {"tokenAddr": this.pylon.options.address, "poolAddr": this.pylon_pool.options.address},
      {"tokenAddr": this.ycrvpylonlp.options.address, "poolAddr": this.ycrvpylonlp_pool.options.address},
      // {"tokenAddr": this.zombie.options.address, "poolAddr": this.zombie_pool.options.address},
      {"tokenAddr": this.pylonlp.options.address, "poolAddr": this.pylonlp_pool.options.address},
      // {"tokenAddr": this.btc.options.address, "poolAddr": this.btc_pool.options.address},
      // {"tokenAddr": this.yalink.options.address, "poolAddr": this.yalink_pool.options.address},
    ]
  }

  setDefaultAccount(
    account
  ) {
    this.yfi.options.from = account;
    this.crv.options.from = account;
    this.solarite.options.from = account;
    this.weth.options.from = account;
  }

  async callContractFunction(
    method,
    options
  ) {
    const { confirmations, confirmationType, autoGasMultiplier, ...txOptions } = options;

    if (!this.blockGasLimit) {
      await this.setGasLimit();
    }

    if (!txOptions.gasPrice && this.defaultGasPrice) {
      txOptions.gasPrice = this.defaultGasPrice;
    }

    if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
      let gasEstimate;
      if (this.defaultGas && confirmationType !== Types.ConfirmationType.Simulate) {
        txOptions.gas = this.defaultGas;
      } else {
        try {
          console.log("estimating gas");
          gasEstimate = await method.estimateGas(txOptions);
        } catch (error) {
          const data = method.encodeABI();
          const { from, value } = options;
          const to = method._parent._address;
          error.transactionData = { from, value, data, to };
          throw error;
        }

        const multiplier = autoGasMultiplier || this.autoGasMultiplier;
        const totalGas = Math.floor(gasEstimate * multiplier);
        txOptions.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
      }

      if (confirmationType === Types.ConfirmationType.Simulate) {
        let g = txOptions.gas;
        return { gasEstimate, g };
      }
    }

    if (txOptions.value) {
      txOptions.value = new BigNumber(txOptions.value).toFixed(0);
    } else {
      txOptions.value = '0';
    }

    const promi = method.send(txOptions);

    const OUTCOMES = {
      INITIAL: 0,
      RESOLVED: 1,
      REJECTED: 2,
    };

    let hashOutcome = OUTCOMES.INITIAL;
    let confirmationOutcome = OUTCOMES.INITIAL;

    const t = confirmationType !== undefined ? confirmationType : this.confirmationType;

    if (!Object.values(Types.ConfirmationType).includes(t)) {
      throw new Error(`Invalid confirmation type: ${t}`);
    }

    let hashPromise;
    let confirmationPromise;

    if (t === Types.ConfirmationType.Hash || t === Types.ConfirmationType.Both) {
      hashPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          promi.on('transactionHash', (txHash) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.RESOLVED;
              resolve(txHash);
              if (t !== Types.ConfirmationType.Both) {
                const anyPromi = promi ;
                anyPromi.off();
              }
            }
          });
        },
      );
    }

    if (t === Types.ConfirmationType.Confirmed || t === Types.ConfirmationType.Both) {
      confirmationPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (
              (t === Types.ConfirmationType.Confirmed || hashOutcome === OUTCOMES.RESOLVED)
              && confirmationOutcome === OUTCOMES.INITIAL
            ) {
              confirmationOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          const desiredConf = confirmations || this.defaultConfirmations;
          if (desiredConf) {
            promi.on('confirmation', (confNumber, receipt) => {
              if (confNumber >= desiredConf) {
                if (confirmationOutcome === OUTCOMES.INITIAL) {
                  confirmationOutcome = OUTCOMES.RESOLVED;
                  resolve(receipt);
                  const anyPromi = promi ;
                  anyPromi.off();
                }
              }
            });
          } else {
            promi.on('receipt', (receipt) => {
              confirmationOutcome = OUTCOMES.RESOLVED;
              resolve(receipt);
              const anyPromi = promi ;
              anyPromi.off();
            });
          }
        },
      );
    }

    if (t === Types.ConfirmationType.Hash) {
      const transactionHash = await hashPromise;
      if (this.notifier) {
          this.notifier.hash(transactionHash)
      }
      return { transactionHash };
    }

    if (t === Types.ConfirmationType.Confirmed) {
      return confirmationPromise;
    }

    const transactionHash = await hashPromise;
    if (this.notifier) {
        this.notifier.hash(transactionHash)
    }
    return {
      transactionHash,
      confirmation: confirmationPromise,
    };
  }

  async callConstantContractFunction(
    method,
    options
  ) {
    const m2 = method;
    const { blockNumber, ...txOptions } = options;
    return m2.call(txOptions, blockNumber);
  }

  async setGasLimit() {
    const block = await this.web3.eth.getBlock('latest');
    this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT;
  }

  setContractProvider(
    contract,
    contractJson,
    provider,
    networkId,
  ){
    contract.setProvider(provider);
    try {
      contract.options.address = contractJson.networks[networkId]
        && contractJson.networks[networkId].address;
    } catch (error) {
      // console.log(error)
    }
  }
}
