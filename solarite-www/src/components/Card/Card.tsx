import React from "react";
import styled from "styled-components";

const Card: React.FC = ({ children }) => <StyledCard>{children}</StyledCard>;

const StyledCard = styled.div`
  background-color: #202840;
  box-shadow: -0.5rem -0.5rem 1rem rgba(52.4, 65.5, 104.8, 0.3),
    0.5rem 0.5rem 1rem rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

export default Card;
