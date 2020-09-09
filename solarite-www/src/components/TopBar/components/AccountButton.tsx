import React, { useCallback } from "react";
import styled from "styled-components";

import { useWallet } from "use-wallet";

import useModal from "../../../hooks/useModal";

import Button from "../../Button";
import WalletProviderModal from "../../WalletProviderModal";

import AccountModal from "./AccountModal";

interface AccountButtonProps {}

const AccountButton: React.FC<AccountButtonProps> = (props) => {
  const [onPresentAccountModal] = useModal(<AccountModal />);
  const [onPresentWalletProviderModal] = useModal(
    <WalletProviderModal />,
    "provider"
  );

  const { account } = useWallet();

  const handleUnlockClick = useCallback(() => {
    onPresentWalletProviderModal();
  }, [onPresentWalletProviderModal]);

  return (
    <StyledAccountButton>
      {!account ? (
        <Button
          onClick={handleUnlockClick}
          size="sm"
          text="CONNECT TO A WALLET"
        />
      ) : (
        <Button onClick={onPresentAccountModal} size="sm" text="My Wallet" />
      )}
    </StyledAccountButton>
  );
};

const StyledAccountButton = styled.div`
  height: 100%;
  width: 156px;
  margin-right: 20px;
  button {
    // height: 100%;
    padding: 20px;
  }
  @media (max-width: 640px) {
    width: 80px;

    button {
      color: transparent;
    }

    button:after {
      content: "Wallet";
      border: none;
      color: white;
      padding-top: 10px;
    }
  }
`;

export default AccountButton;
