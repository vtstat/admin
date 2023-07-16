import {
  Box,
  Button,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { atom, useAtom, useSetAtom } from "jotai";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";

import FormInput from "../components/FormInput";
import { client } from "../main";
import { fetch, put } from "../utils/fetch";

const modalOpenAtom = atom(false);

type VTuber = {
  vtuber_id: string;
  native_name: string;
  english_name: string;
  japanese_name: string;
  twitter_username: string;
  debuted_at: string | null;
  retired_at: string | null;
};

const VTubers: React.FC = ({}) => {
  const { data: vtubers = [] } = useQuery(["vtubers"], () =>
    fetch<VTuber[]>("/vtubers")
  );

  const setOpen = useSetAtom(modalOpenAtom);

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="0" zIndex={1000} bgColor="white">
          <Tr>
            <Th isNumeric>ID</Th>
            <Th>Native Name</Th>
            <Th>English Name</Th>
            <Th>Japanese Name</Th>
            <Th>Twitter</Th>
            <Th>Debuted</Th>
            <Th>Retired</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vtubers.map((vtuber) => (
            <Tr key={vtuber.vtuber_id}>
              <Td isNumeric>{vtuber.vtuber_id}</Td>
              <Td>{vtuber.native_name}</Td>
              <Td>{vtuber.english_name}</Td>
              <Td>{vtuber.japanese_name}</Td>
              <Td>
                <Link
                  target="_blank"
                  href={"https://twitter.com/" + vtuber.twitter_username}
                >
                  @{vtuber.twitter_username}
                </Link>
              </Td>
              <Td>{vtuber.debuted_at}</Td>
              <Td>{vtuber.retired_at}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Box position="fixed" right={8} bottom={8} zIndex={1000}>
        <IconButton
          aria-label="add vtuber"
          colorScheme="teal"
          isRound
          size="lg"
          onClick={() => setOpen(true)}
          icon={
            <svg
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
            >
              <path d="M23,17H17V23H15V17H9V15H15V9H17V15H23V17Z" />
            </svg>
          }
        />
      </Box>

      <AddVTuberModal />
    </TableContainer>
  );
};

const AddVTuberModal: React.FC = () => {
  type FormValues = {
    vtuber_id: string;
    native_name: string;
    english_name?: string;
    japanese_name?: string;
    twitter_username?: string;
    youtube_channel_id: string;
  };

  const [open, setOpen] = useAtom(modalOpenAtom);

  const { mutateAsync } = useMutation((body: FormValues) =>
    put("/vtuber", body)
  );

  const toast = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    await mutateAsync(values);
    setOpen(false);
    toast({
      title: "VTuber created.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    client.refetchQueries(["vtubers"]);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      onCloseComplete={() => reset()}
    >
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add VTuber</ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <Stack gap={4}>
              <FormInput<FormValues>
                control={control}
                name="vtuber_id"
                label="ID"
                required
                rules={{ required: true, pattern: /^[A-Za-z_]{3,}$/ }}
                inputProps={{
                  placeholder: "must be unique, e.g. shirakami_fubiki",
                  spellCheck: false,
                }}
              />

              <FormInput<FormValues>
                control={control}
                name="native_name"
                label="Native name"
                required
                rules={{ required: true, minLength: 2 }}
                inputProps={{
                  placeholder: "e.g. 白上フブキ, Mori Calliope",
                  spellCheck: false,
                }}
              />

              <FormInput<FormValues>
                control={control}
                name="english_name"
                label="English name"
                rules={{ minLength: 2 }}
                inputProps={{
                  placeholder: "e.g. Shirakami Fubuki, Mori Calliope",
                  spellCheck: false,
                }}
              />

              <FormInput<FormValues>
                control={control}
                name="japanese_name"
                label="Japanese name"
                rules={{ minLength: 3 }}
                inputProps={{
                  placeholder: "e.g. 白上フブキ, 森カリオペ",
                  spellCheck: false,
                }}
              />

              <FormInput<FormValues>
                control={control}
                name="twitter_username"
                label="Twitter username"
                rules={{ minLength: 3, pattern: /^[A-Za-z0-9_]*$/ }}
                inputProps={{
                  placeholder: "e.g. shirakamifubuki",
                  spellCheck: false,
                }}
              />

              <FormInput<FormValues>
                control={control}
                name="youtube_channel_id"
                label="YouTube Channel ID"
                required
                rules={{ required: true, pattern: /^[A-Za-z0-9-_]{24}$/ }}
                inputProps={{
                  placeholder: "e.g. UCoSrY_IQQVpmIRZ9Xf-y93g",
                  spellCheck: false,
                }}
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={() => setOpen(false)}>
              Close
            </Button>

            <Button
              colorScheme="teal"
              isLoading={isSubmitting}
              loadingText="Submitting"
              type="submit"
            >
              Submit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default VTubers;
