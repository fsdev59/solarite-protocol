import React, { useCallback, useEffect, useState } from "react";

import { Contract } from "web3-eth-contract";

import { solarite as solariteAddress } from "../../constants/tokenAddresses";
import useSolarite from "../../hooks/useSolarite";
import { getPoolContracts } from "../../solariteUtils";

import Context from "./context";
import { Farm } from "./types";

// const NAME_FOR_POOL: { [key: string]: string } = {
//   eth_pool: 'Weth Homestead',
//   yam_pool: 'YAM',
//   crv_pool: 'Curvy Fields',
//   yfi_pool: 'YFI Farm',
//   yfii_pool: 'YFII Farm',
//   comp_pool: 'Compounding Hills',
//   link_pool: 'Marine Gardens',
//   lend_pool: 'Aave Agriculture',
//   snx_pool: 'Spartan Grounds',
//   mkr_pool: 'Maker Range',
//   ycrvUNIV_pool: 'Eternal Lands',
// }

// const ICON_FOR_POOL: { [key: string]: string } = {
//   yfi_pool: '🐋',
//   yfii_pool: '🦈',
//   yam_pool: '🍠',
//   eth_pool: '🌎',
//   crv_pool: '🚜',
//   comp_pool: '💸',
//   link_pool: '🔗',
//   lend_pool: '🏕️',
//   snx_pool: '⚔️',
//   mkr_pool: '🐮',
//   ycrvUNIV_pool: '🌈',
// }

const NAME_FOR_POOL: { [key: string]: string } = {
  eth_pool: "Assimilator",
  comp_pool: "Cybernetics Core",
  link_pool: 'Marine Barracks',
  lend_pool: "Lend Shark",
  snx_pool: "Synthetix Silos",
  btc_pool: "Stargate",
  yalink_pool: "Templar Archives",
  ycrvUNIV_pool: "Twilight Council",
  based_pool: "All Your Based",
  ethpylonlp_pool: "Ethereum Planes",
  ewtb_pool: "Array",
  pylon_pool: "Mirror Farm",
  ycrvpylonlp_pool: "Beyond the Curve",
  zombie_pool: "Zombie Graveyard",
  pylonlp_pool: "Solarite Pylon",
};

const ICON_FOR_POOL: { [key: string]: string } = {
  eth_pool: "Icon_Protoss_Assimilator.png",
  comp_pool: "Icon_Protoss_Cybernetics_Core.png",
  link_pool: 'Icon_link.png',
  lend_pool: "Icon_lend.png",
  snx_pool: "Icon_snx.png",
  btc_pool: "Icon_Protoss_Robotics_Facility.png",
  yalink_pool: "Icon_Protoss_Stargate.png",
  ycrvUNIV_pool: "Icon_ewtb.png",
  based_pool: "Icon_based.png",
  ethpylonlp_pool: "Icon_eth_pylon.png",
  ewtb_pool: "Icon_ewtb.png",
  pylon_pool: "Icon_pylon.png",
  ycrvpylonlp_pool: "Icon_ycrv_pylon.png",
  zombie_pool: "Icon_zombie.png",
  pylonlp_pool: "Icon_based.png",
};

// const SORT_FOR_POOL: { [key: string]: number } = {
//   yfi_pool: 0,
//   eth_pool: 1,
//   ampl_pool: 2,
//   comp_pool: 3,
//   ycrv_pool: 4,
//   link_pool: 5,
//   lend_pool: 6,
//   snx_pool: 7,
//   mkr_pool: 8,
// }

// const SORT_FOR_POOL: { [key: string]: number } = {
//   eth_pool: 6,
//   comp_pool: 2,
//   link_pool: 3,
//   lend_pool: 1,
//   snx_pool: 4,
//   btc_pool: 5,
// }

const Farms: React.FC = ({ children }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const solarite = useSolarite();

  const fetchPools = useCallback(async () => {
    const pools: { [key: string]: Contract } = await getPoolContracts(solarite);

    const farmsArr: Farm[] = [];
    const poolKeys = Object.keys(pools);

    console.log("poolkey", pools);

    for (let i = 0; i < poolKeys.length - 1; i++) {
      const poolKey = poolKeys[i];
      const pool = pools[poolKey];
      console.log(poolKey);

      let tokenKey = poolKey.replace("_pool", "");
      
      if (tokenKey === "ycrvUNIV") {
        tokenKey = 'uni_lp'
        //tokenKey = "";
      } else if (tokenKey === "ethpylonlp") {
        tokenKey = "eth_pylon_uni_lp";
      } else if (tokenKey === "ycrvpylonlp") {
        tokenKey = "ycrv_pylon_uni_lp";
      } else if (tokenKey === "pylonlp") {
        tokenKey = "solarite_pylon_uni_lp";
      }

      const method = pool.methods[tokenKey];
      console.log(tokenKey);
      console.log(method);

      if (method) {
        try {
          let tokenAddress = "";
          if (tokenKey === "uni_lp") {
            // checking need to update with new uni_lp for solarite
            tokenAddress = "0x7bc3a77b1b8daa4bf4b38c710119b932c5b27925";
          } else {
            tokenAddress = await method().call();
          }
          farmsArr.push({
            contract: pool,
            name: NAME_FOR_POOL[poolKey],
            depositToken: tokenKey,
            depositTokenAddress: tokenAddress,
            earnToken: "solarite",
            earnTokenAddress: solariteAddress,
            icon: ICON_FOR_POOL[poolKey],
            id: tokenKey,
          });

          
        } catch (e) {
          console.log(e);
        }
      }
    }
    setFarms(farmsArr);
  }, [solarite, setFarms]);

  useEffect(() => {
    if (solarite) {
      fetchPools();
    }
  }, [solarite, fetchPools]);

  return <Context.Provider value={{ farms }}>{children}</Context.Provider>;
};

export default Farms;
