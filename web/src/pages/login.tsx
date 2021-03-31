import React from "react";
import { Form, Formik } from "formik";
import Wrapper from "src/components/Wrapper";
import InputField from "src/components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { useLoginMutation } from "src/generated/graphql";
import { useRouter } from "next/router";

interface Props {}

const login: React.FC<Props> = () => {
  const [, login] = useLoginMutation();
  const router = useRouter();
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setStatus }) => {
          const res = await login({ options: values });

          if (res.data?.login.errors) setStatus(res.data.login.errors[0]);
          else router.push("/");
        }}
      >
        {({ isSubmitting, status }) => (
          <Form>
            {status && (
              <Box
                maxW="800px"
                w="100%"
                mx="auto"
                backgroundColor="red"
                color="white"
                minH="2rem"
                mb="2rem"
                borderRadius="8px"
                fontSize="1.5rem"
                textAlign="center"
                alignContent="center"
              >
                {status.message}
              </Box>
            )}
            <InputField name="username" label="Username" />
            <InputField name="password" label="Password" type="password" />
            <Button
              isLoading={isSubmitting}
              type="submit"
              backgroundColor="teal"
              color="white"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default login;
