import React from "react";
import { Form, Formik } from "formik";
import Wrapper from "src/components/Wrapper";
import InputField from "src/components/InputField";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { MeDocument, MeQuery, useLoginMutation } from "src/generated/graphql";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { withApollo } from "src/utils/withApollo";

interface Props {}

const login: React.FC<Props> = () => {
  const [login] = useLoginMutation();
  const router = useRouter();
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setStatus }) => {
          const res = await login({
            variables: { options: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.login.user,
                },
              });
            },
          });

          if (res.data?.login.errors) setStatus(res.data.login.errors[0]);
          else {
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
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
            <Flex alignItems="center">
              <Button
                isLoading={isSubmitting}
                type="submit"
                backgroundColor="teal"
                color="white"
              >
                Login
              </Button>
              <NextLink href="/forgot-password">
                <Link color="teal" ml="auto">
                  Forgot password?
                </Link>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(login);
