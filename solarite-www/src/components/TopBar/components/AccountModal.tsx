import React, { useCallback } from "react";
import styled from "styled-components";
import { useWallet } from "use-wallet";

import {
  solarite as solariteAddress,
  solaritev2 as solariteV2Address,
} from "../../../constants/tokenAddresses";
import useTokenBalance from "../../../hooks/useTokenBalance";
import { getDisplayBalance } from "../../../utils/formatBalance";

import Button from "../../Button";
import CardIcon from "../../CardIcon";
import Label from "../../Label";
import Modal, { ModalProps } from "../../Modal";
import ModalActions from "../../ModalActions";
import ModalContent from "../../ModalContent";
import ModalTitle from "../../ModalTitle";
import Separator from "../../Separator";
import Spacer from "../../Spacer";
import Value from "../../Value";

import famerImg from "../../../assets/img/farmer.png";

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const { account, reset } = useWallet();

  const handleSignOutClick = useCallback(() => {
    onDismiss!();
    reset();
  }, [onDismiss, reset]);

  const solariteBalance = useTokenBalance(solariteAddress);
  const solariteV2Balance = useTokenBalance(solariteV2Address);

  return (
    <Modal>
      <ModalTitle text="My Account" />
      {/* <ModalContent>
        <Spacer /> */}

      {/* <div style={{ display: "flex" }}> */}
      <StyledBalanceWrapper>
        <CardIcon>
          <span>
            <img src={famerImg} height="32" />
          </span>
        </CardIcon>
        <StyledBalance>
          <Value value={getDisplayBalance(solariteV2Balance, 24)} />
          <Label text="SOLARITE Balance" />
        </StyledBalance>
      </StyledBalanceWrapper>
      {/* </div>

        <Spacer />
        <Button
          href={`https://etherscan.io/address/${account}`}
          text="View on Etherscan"
          variant="secondary"
        />
        <Spacer /> */}
      <Button
        onClick={handleSignOutClick}
        text="Sign out"
        // variant="secondary"
      />
      {/* </ModalContent> */}
      {/* <ModalActions>
        <Button onClick={onDismiss} text="Cancel" />
      </ModalActions> */}
    </Modal>
  );
};

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledValue = styled.div`
  color: ${(props) => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`;

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  // flex: 1;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.spacing[2]}px;
`;

export default AccountModal;
