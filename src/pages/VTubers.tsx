import {
  Box,
  Button,
  IconButton,
  Img,
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
} from "@chakra-ui/react";
import { atom, useAtom, useSetAtom } from "jotai";
import React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";

import FormInput from "../components/FormInput";
import { client } from "../main";
import { useFetch } from "../utils/fetch";

const editVTuberModalStateAtom = atom<{
  open: boolean;
  vtuber?: VTuber;
  mode: "Add" | "Edit";
}>({ mode: "Add", open: false });

const renameVTuberIdStateAtom = atom<string | null>(null);

type VTuber = {
  vtuberId: string;
  thumbnailUrl?: string;
  nativeName: string;
  englishName?: string;
  japaneseName?: string;
  twitterUsername?: string;
  debutedAt?: number;
  retiredAt?: number;
};

const Add: React.FC = () => (
  <svg fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M23,17H17V23H15V17H9V15H15V9H17V15H23V17Z" />
  </svg>
);

const VTubers: React.FC = ({}) => {
  const { get } = useFetch();
  const { data: vtubers = [] } = useQuery(["vtubers"], () =>
    get<VTuber[]>("/vtubers")
  );

  const setModalState = useSetAtom(editVTuberModalStateAtom);
  const setRenameVTuberId = useSetAtom(renameVTuberIdStateAtom);

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="60px" zIndex={1000} bgColor="white">
          <Tr>
            <Th>Thumbnail</Th>
            <Th>ID</Th>
            <Th>Native Name</Th>
            <Th>English Name</Th>
            <Th>Japanese Name</Th>
            <Th>Twitter</Th>
            <Th>Debuted</Th>
            <Th>Retired</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vtubers.map((vtuber) => (
            <Tr key={vtuber.vtuberId}>
              <Td>
                {vtuber.thumbnailUrl && (
                  <Img
                    loading="lazy"
                    src={vtuber.thumbnailUrl}
                    w="40px"
                    h="40px"
                    borderRadius="9999px"
                  />
                )}
              </Td>
              <Td>{vtuber.vtuberId}</Td>
              <Td>{vtuber.nativeName}</Td>
              <Td>{vtuber.englishName}</Td>
              <Td>{vtuber.japaneseName}</Td>
              <Td>
                <Link
                  target="_blank"
                  href={"https://twitter.com/" + vtuber.twitterUsername}
                >
                  @{vtuber.twitterUsername}
                </Link>
              </Td>
              <Td>{vtuber.debutedAt}</Td>
              <Td>{vtuber.retiredAt}</Td>
              <Td>
                <Button
                  colorScheme="teal"
                  variant="link"
                  onClick={() => setRenameVTuberId(vtuber.vtuberId)}
                >
                  Rename ID
                </Button>

                <Button
                  colorScheme="teal"
                  variant="link"
                  onClick={() =>
                    setModalState({ mode: "Edit", open: true, vtuber })
                  }
                >
                  Edit
                </Button>
              </Td>
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
          onClick={() => setModalState({ open: true, mode: "Add" })}
          icon={<Add />}
        />
      </Box>

      <RenameVTuberIdModal />
      <EditVTuberModal />
    </TableContainer>
  );
};

const RenameVTuberIdModal: React.FC = () => {
  type FormValues = { vtuberId: string };

  const [renameVTuberId, setRenameVTuberId] = useAtom(renameVTuberIdStateAtom);

  const { post } = useFetch();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({ values: { vtuberId: renameVTuberId || "" } });

  const onSubmit = async (values: FormValues) => {
    await post("/vtuber/rename", {
      before: renameVTuberId,
      after: values.vtuberId,
    });
    reset();
    client.refetchQueries(["vtubers"]);
    setRenameVTuberId(null);
  };

  return (
    <Modal
      isOpen={typeof renameVTuberId === "string"}
      onClose={() => setRenameVTuberId(null)}
    >
      <ModalOverlay />

      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Rename VTuber Id</ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <FormInput<FormValues>
              control={control}
              name="vtuberId"
              label="ID"
              required
              rules={{ required: true, pattern: /^[a-z-]{3,}$/ }}
              inputProps={{
                placeholder: "must be unique, e.g. shirakami-fubuki",
                spellCheck: false,
                onBlur: (e) => {
                  setValue(
                    "vtuberId",
                    e.target.value.split(" ").join("-").toLowerCase()
                  );
                },
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={() => setRenameVTuberId(null)}>
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

const EditVTuberModal: React.FC = () => {
  type FormValues = VTuber & {
    youtubeChannelId?: string;
  };

  const [{ open, mode, vtuber }, setModalState] = useAtom(
    editVTuberModalStateAtom
  );

  const { put, post } = useFetch();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ values: vtuber });

  const onSubmit = async (values: FormValues) => {
    if (mode === "Add") {
      await put("/vtuber", values);
    } else {
      await post("/vtuber", values);
    }
    setModalState({ open: false, mode: "Add" });
    client.refetchQueries(["vtubers"]);
    reset();
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => setModalState({ open: false, mode: "Add" })}
      onCloseComplete={() => reset()}
    >
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>{mode} VTuber</ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <Stack gap={4}>
              <FormInput<FormValues>
                control={control}
                name="vtuberId"
                label="ID"
                required
                rules={{ required: true, pattern: /^[A-Za-z-_]{3,}$/ }}
                inputProps={{
                  placeholder: "must be unique, e.g. shirakami-fubuki",
                  spellCheck: false,
                  isReadOnly: mode === "Edit",
                }}
              />

              <FormInput<FormValues>
                control={control}
                name="nativeName"
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
                name="englishName"
                label="English name"
                rules={{ minLength: 2 }}
                inputProps={{
                  placeholder: "e.g. Shirakami Fubuki, Mori Calliope",
                  spellCheck: false,
                }}
              />

              <FormInput<FormValues>
                control={control}
                name="japaneseName"
                label="Japanese name"
                rules={{ minLength: 3 }}
                inputProps={{
                  placeholder: "e.g. 白上フブキ, 森カリオペ",
                  spellCheck: false,
                }}
              />

              <FormInput<FormValues>
                control={control}
                name="twitterUsername"
                label="Twitter username"
                rules={{ minLength: 3, pattern: /^[A-Za-z0-9_]*$/ }}
                inputProps={{
                  placeholder: "e.g. shirakamifubuki",
                  spellCheck: false,
                }}
              />

              {mode === "Add" && (
                <FormInput<FormValues>
                  control={control}
                  name="youtubeChannelId"
                  label="YouTube Channel ID"
                  required
                  rules={{ required: true, pattern: /^[A-Za-z0-9-_]{24}$/ }}
                  inputProps={{
                    placeholder: "e.g. UCoSrY_IQQVpmIRZ9Xf-y93g",
                    spellCheck: false,
                  }}
                />
              )}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              onClick={() => setModalState({ open: false, mode: "Add" })}
            >
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
