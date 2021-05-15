import { NextPage } from "next";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/react";
import Wrapper from "../../components/Wrapper";
import InputField from "../../components/InputField";
import { useChangePasswordMutation } from "src/generated/graphql";
import { useRouter } from "next/router";
import { withApollo } from "src/utils/withApollo";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  return (
    <Wrapper>
      <Formik
        initialValues={{ newPassword: "", confirmNewPassword: "" }}
        onSubmit={async (values, { setStatus }) => {
          const res = await changePassword({
            variables: { options: { ...values, token } },
          });

          if (res.data?.changePassword.errors)
            setStatus(res.data.changePassword.errors[0]);
          else router.push("/login");
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
            <InputField
              name="newPassword"
              label="New Password"
              type="password"
            />
            <InputField
              name="confirmNewPassword"
              label="Confirm New Password"
              type="password"
            />
            <Button
              isLoading={isSubmitting}
              type="submit"
              backgroundColor="teal"
              color="white"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withApollo({ ssr: true })(ChangePassword as React.FC);
