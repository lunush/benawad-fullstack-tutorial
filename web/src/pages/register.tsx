import React from "react";
import { Form, Formik } from "formik";
import Wrapper from "src/components/Wrapper";
import InputField from "src/components/InputField";
import { Box, Button } from "@chakra-ui/react";
import {
  MeDocument,
  MeQuery,
  useRegisterMutation,
} from "src/generated/graphql";
import { useRouter } from "next/router";
import { withApollo } from "src/utils/withApollo";

interface Props {}

const register: React.FC<Props> = () => {
  const [register] = useRegisterMutation();
  const router = useRouter();
  return (
    <Wrapper>
      <Formik
        initialValues={{
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        onSubmit={async (values, { setStatus }) => {
          const res = await register({
            variables: { options: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.register.user,
                },
              });
            },
          });

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
            <InputField name="email" label="Email (optional)" />
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

export default withApollo({ ssr: false })(register);
