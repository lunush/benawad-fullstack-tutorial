import React, { useState } from "react";
import { Form, Formik } from "formik";
import Wrapper from "src/components/Wrapper";
import InputField from "src/components/InputField";
import { Button } from "@chakra-ui/react";
import { useForgotPasswordMutation } from "src/generated/graphql";
import { createUrqlClient } from "src/utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

interface Props {}

const forgotPassword: React.FC<Props> = () => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  if (complete)
    return (
      <Wrapper>
        Reset link was sent to the provided email address. It is available for
        the next 10 minutes.
      </Wrapper>
    );

  return (
    <Wrapper>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async ({ email }) => {
          await forgotPassword({ email });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="email" label="Email" />
            <Button
              isLoading={isSubmitting}
              type="submit"
              backgroundColor="teal"
              color="white"
            >
              Reset Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(forgotPassword);
