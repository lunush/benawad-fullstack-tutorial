import React from "react";
import Navbar from "./Navbar";
import Wrapper, { WrapperVariant } from "./Wrapper";

interface Props {
  variant?: WrapperVariant;
}

const Layout: React.FC<Props> = ({ children, variant }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;
