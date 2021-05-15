import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import InputField from "src/components/InputField";
import Layout from "src/components/Layout";
import { useCreatePostMutation } from "src/generated/graphql";
import { useIsAuth } from "src/utils/useIsAuth";
import { withApollo } from "src/utils/withApollo";

interface Props {}

const CreatePost: React.FC<Props> = ({}) => {
  const [createPost] = useCreatePostMutation();
  const router = useRouter();

  useIsAuth();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setStatus }) => {
          const res = await createPost({
            variables: { input: values },
            update: (cache) => cache.evict({ fieldName: "posts" }),
          });

          if (res.data?.createPost.errors)
            setStatus(res.data.createPost.errors[0]);
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
            <InputField name="title" label="Title" />
            <InputField name="text" label="Text" textarea />
            <Button
              isLoading={isSubmitting}
              type="submit"
              backgroundColor="teal"
              color="white"
            >
              Create
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
