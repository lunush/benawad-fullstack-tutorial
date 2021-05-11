import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { usePostQuery, useUpdatePostMutation } from "src/generated/graphql";
import { createUrqlClient } from "src/utils/createUrqlClient";
import Layout from "../../components/Layout";
import InputField from "src/components/InputField";

interface Props {}

const EditPost: React.FC<Props> = () => {
  const router = useRouter();
  const id =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  const [, updatePost] = useUpdatePostMutation();

  const [{ data, fetching }] = usePostQuery({
    pause: id === -1,
    variables: {
      id,
    },
  });

  if (fetching) {
    return <Layout>Loading...</Layout>;
  }

  if (!data?.post) {
    return <Layout>Unable to fetch the data.</Layout>;
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          const { title, text } = values;
          await updatePost({ id, title, text });

          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" label="Title" />
            <InputField name="text" label="Text" textarea />
            <Button
              isLoading={isSubmitting}
              type="submit"
              backgroundColor="teal"
              color="white"
            >
              Update
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(EditPost);
