import { Box } from "@chakra-ui/react";
import React from "react";

interface Props {
  variant?: "small" | "regular";
}

const Wrapper: React.FC<Props> = ({ children, variant = "regular" }) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
    >
      {children}
    </Box>
  );
};

export default Wrapper;
