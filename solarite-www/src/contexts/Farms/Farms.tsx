import React, { useCallback, useEffect, useState } from "react";

import { useWallet } from "use-wallet";
import { Contract } from "web3-eth-contract";

import { solarite as solariteAddress } from "../../constants/tokenAddresses";
import useSolarite from "../../hooks/useSolarite";

import { bnToDec } from "../../utils";
import { getPoolContracts, getEarned } from "../../solariteUtils";

import Context from "./context";
import { Farm } from "./types";

const NAME_FOR_POOL: { [key: string]: string } = {
  yfi_pool: "Assimilator",
  eth_pool: "Cybernetics Core",
  ampl_pool: "Forge",
  ycrv_pool: "Oracle",
  comp_pool: "Robotics Facility",
  link_pool: "Stargate",
  lend_pool: "Templar Archives",
  snx_pool: "Warp Gate",
  mkr_pool: "Twilight Council",
};

const ICON_FOR_POOL: { [key: string]: string } = {
  yfi_pool: "Icon_Protoss_Assimilator.png",
  eth_pool: "Icon_Protoss_Cybernetics_Core.png",
  ampl_pool: "Icon_Protoss_Forge.png",
  comp_pool: "Icon_Protoss_Oracle.png",
  link_pool: "Icon_Protoss_Robotics_Facility.png",
  lend_pool: "Icon_Protoss_Stargate.png",
  snx_pool: "Icon_Protoss_Templar_Archives.png",
  mkr_pool: "Icon_Protoss_Warp_Gate.png",
  ycrv_pool: "twilight_council.png",
};

const SORT_FOR_POOL: { [key: string]: number } = {
  yfi_pool: 0,
  eth_pool: 1,
  ampl_pool: 2,
  comp_pool: 3,
  ycrv_pool: 4,
  link_pool: 5,
  lend_pool: 6,
  snx_pool: 7,
  mkr_pool: 8,
};

const Farms: React.FC = ({ children }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [unharvested, setUnharvested] = useState(0);

  const solarite = useSolarite();
  const { account } = useWallet();

  const fetchPools = useCallback(async () => {
    const pools: { [key: string]: Contract } = await getPoolContracts(solarite);
    const farmsArr: Farm[] = [];
    const poolKeys = Object.keys(pools);

    for (let i = 0; i < poolKeys.length; i++) {
      const poolKey = poolKeys[i];
      const pool = pools[poolKey];
      let tokenKey = poolKey.replace("_pool", "");
      if (tokenKey === "eth") {
        tokenKey = "weth";
      } else if (tokenKey === "ampl") {
        tokenKey = "ampl_eth_uni_lp";
      } else if (tokenKey === "ycrv") {
        tokenKey = "ycrv_solarite_uni_lp";
      }

      const method = pool.methods[tokenKey];
      try {
        let tokenAddress = "";
        if (method) {
          tokenAddress = await method().call();
        } else if (tokenKey === "ycrv_solarite_uni_lp") {
          tokenAddress = "0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8";
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
          sort: SORT_FOR_POOL[poolKey],
        });
      } catch (e) {
        console.log(e);
      }
    }
    farmsArr.sort((a, b) => (a.sort < b.sort ? 1 : -1));
    setFarms(farmsArr);
  }, [solarite, setFarms]);

  useEffect(() => {
    if (solarite) {
      fetchPools();
    }
  }, [solarite, fetchPools]);

  useEffect(() => {
    async function fetchUnharvested() {
      const unharvestedBalances = await Promise.all(
        farms.map(async (farm: Farm) => {
          const earnings = await getEarned(solarite, farm.contract, account);
          return bnToDec(earnings);
        })
      );
      const totalBal = unharvestedBalances.reduce((acc, val) => acc + val);
      setUnharvested(totalBal);
    }
    if (account && farms.length && solarite) {
      fetchUnharvested();
    }
  }, [account, farms, setUnharvested, solarite]);

  return (
    <Context.Provider
      value={{
        farms,
        unharvested,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default Farms;
