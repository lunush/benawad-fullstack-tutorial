import React from "react";
import { Form, Formik } from "formik";
import Wrapper from "src/components/Wrapper";
import InputField from "src/components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { useRegisterMutation } from "src/generated/graphql";
import { useRouter } from "next/router";

interface Props {}

const register: React.FC<Props> = () => {
  const [, register] = useRegisterMutation();
  const router = useRouter();
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: "", password: "", confirmPassword: "" }}
        onSubmit={async (values, { setStatus }) => {
          const res = await register(values);

          if (res.data?.register.errors) setStatus(res.data.register.errors[0]);
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
            <InputField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
            />
            <Button
              isLoading={isSubmitting}
              type="submit"
              backgroundColor="teal"
              color="white"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default register;
