import React from "react";
import styled, { keyframes } from "styled-components";

import Card from "../Card";
import CardContent from "../CardContent";
import Container from "../Container";

export interface ModalProps {
  onDismiss?: () => void;
}

const Modal: React.FC = ({ children }) => {
  return (
    <Container size="sm">
      <StyledModal>
        <Card>
          <CardContent>{children}</CardContent>
        </Card>
      </StyledModal>
    </Container>
  );
};

const mobileKeyframes = keyframes`
  0% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(-100%);
  }
`;

const StyledResponsiveWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  width: 100%;
  max-width: 512px;
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    flex: 1;
    position: absolute;
    top: 100%;
    right: 0;
    left: 0;
    max-height: calc(100% - ${(props) => props.theme.spacing[4]}px);
    animation: ${mobileKeyframes} 0.3s forwards ease-out;
  }
`;

// const StyledModal = styled.div`
//   background: ${(props) => props.theme.color.grey[200]};
//   border: 1px solid ${(props) => props.theme.color.grey[300]}ff;
//   border-radius: 12px;
//   box-shadow: inset 1px 1px 0px ${(props) => props.theme.color.grey[100]};
//   display: flex;
//   flex-direction: column;
//   position: relative;
//   width: 100%;
//   min-height: 0;
// `;

const StyledModal = styled.div`
  border-radius: 12px;
  box-shadow: 24px 24px 48px -24px ${(props) => props.theme.color.grey[600]};
  position: relative;
`;

const StyledModalContent = styled.div``;

export default Modal;
