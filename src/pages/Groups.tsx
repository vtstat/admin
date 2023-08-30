import {
  Alert,
  AlertIcon,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { atom, useAtom, useSetAtom } from "jotai";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "react-query";

import FormInput from "../components/FormInput";
import { client } from "../main";
import { useFetch } from "../utils/fetch";

type Props = {};

type Group = {
  groupId: string;
  root: boolean;
  nativeName: string;
  englishName: string;
  japaneseName: string;
  children: string[];
};

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

const AvatarList: React.FC<{ items: string[] }> = ({ items }) => {
  const { get } = useFetch();

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: () => get<Group[]>("/groups"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: vtubers = [] } = useQuery({
    queryKey: ["vtubers"],
    queryFn: () => get<VTuber[]>("/vtubers"),
    staleTime: 5 * 60 * 1000,
  });

  items.sort((a, b) => b.localeCompare(a));

  const avatars = [];
  const names = [];
  let notExisted = false;

  for (const item of items) {
    if (item.startsWith("group:")) {
      const id = item.slice(6);
      const group = groups.find((g) => g.groupId === id);

      if (group) {
        names.push(group.nativeName);
      } else {
        notExisted = true;
        names.push(`${id} (not existed)`);
      }
      avatars.push(<Avatar key={item} name={group?.nativeName || id} />);
    }

    if (item.startsWith("vtuber:")) {
      const id = item.slice(7);
      const vtuber = vtubers.find((g) => g.vtuberId === id);

      if (vtuber) {
        names.push(vtuber.nativeName);
      } else {
        notExisted = true;
        names.push(`${id} (not existed)`);
      }
      avatars.push(
        <Avatar
          key={item}
          name={vtuber?.nativeName || id}
          src={vtuber?.thumbnailUrl}
        />
      );
    }
  }

  return (
    <Tooltip label={<div>{names.join(", ")}</div>} placement="bottom-start">
      <Box
        display="inline-flex"
        backgroundColor={notExisted ? "red.500" : ""}
        borderRadius="8px"
      >
        <AvatarGroup size="md" max={6}>
          {avatars}
        </AvatarGroup>
      </Box>
    </Tooltip>
  );
};

const Groups: React.FC<Props> = ({}) => {
  const { get } = useFetch();

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: () => get<Group[]>("/groups"),
    select: (groups) =>
      groups.sort((a, b) => a.groupId.localeCompare(b.groupId)),
    staleTime: 5 * 60 * 1000,
  });

  const setEditModalState = useSetAtom(editModalState);

  return (
    <div>
      <Box p="8px">
        <NotInGroup />
      </Box>

      <TableContainer overflowX="unset" overflowY="unset">
        <Table variant="striped" colorScheme="blackAlpha">
          <Thead position="sticky" top="60px" zIndex={1000} bgColor="white">
            <Tr>
              <Th>ID</Th>
              <Th>Root</Th>
              <Th>Native Name</Th>
              <Th>English Name</Th>
              <Th>Japanese Name</Th>
              <Th>Children</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {groups?.map((group) => (
              <Tr key={group.groupId}>
                <Td>{group.groupId}</Td>
                <Td>
                  {group.root ? (
                    <Tag colorScheme="red">True</Tag>
                  ) : (
                    <Tag>False</Tag>
                  )}
                </Td>
                <Td>{group.nativeName}</Td>
                <Td>{group.englishName}</Td>
                <Td>{group.japaneseName}</Td>
                <Td>
                  <AvatarList items={group.children} />
                </Td>
                <Td>
                  <Button
                    colorScheme="teal"
                    variant="link"
                    onClick={() => {
                      setEditModalState({ open: true, group });
                    }}
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
            aria-label="add group"
            colorScheme="teal"
            isRound
            size="lg"
            onClick={() => setEditModalState({ open: true })}
            icon={<Add />}
          />
        </Box>

        <EditGroupModal />
      </TableContainer>
    </div>
  );
};

const Add: React.FC = () => (
  <svg fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M23,17H17V23H15V17H9V15H15V9H17V15H23V17Z" />
  </svg>
);

const editModalState = atom<{ open: boolean; group?: Group }>({
  open: false,
});

const NotInGroup: React.FC = () => {
  const { get } = useFetch();

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: () => get<Group[]>("/groups"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: vtubers = [] } = useQuery({
    queryKey: ["vtubers"],
    queryFn: () => get<VTuber[]>("/vtubers"),
    staleTime: 5 * 60 * 1000,
  });

  const vtuberNotInGroup = vtubers.filter(
    (vtuber) =>
      !groups.some((group) =>
        group.children.includes(`vtuber:${vtuber.vtuberId}`)
      )
  );

  const subgroupNotInGroup = groups.filter(
    (group) =>
      !group.root &&
      !groups.some((g) => g.children.includes(`group:${group.groupId}`))
  );

  if (vtuberNotInGroup.length === 0 && subgroupNotInGroup.length === 0) {
    return null;
  }

  return (
    <Alert status="warning">
      <AlertIcon />
      Some vtuber(s), group(s) is not in any group:{" "}
      {[...vtuberNotInGroup, ...subgroupNotInGroup]
        .map((i) => i.nativeName)
        .join(", ")}
    </Alert>
  );
};

const EditGroupModal: React.FC = () => {
  type FormValues = Group;

  const [{ open, group }, setModalState] = useAtom(editModalState);

  const { post } = useFetch();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ values: group });

  const onSubmit = async (values: FormValues) => {
    const groups = client.getQueryData<Group[]>(["groups"]) || [];
    const vtubers = client.getQueryData<VTuber[]>(["vtubers"]) || [];

    values.children = values.children.filter(
      (id) =>
        groups.some((g) => `group:${g.groupId}` !== id) ||
        vtubers.some((v) => `vtuber:${v.vtuberId}` !== id)
    );

    if (group && values.groupId !== group.groupId) {
      await post("/groups", [
        values,
        { ...values, children: [], groupId: group?.groupId },
      ]);
    } else {
      await post("/groups", [values]);
    }
    setModalState({ open: false });
    client.refetchQueries(["groups"]);
    reset();
  };

  return (
    <Modal
      size="4xl"
      isCentered
      isOpen={open}
      onClose={() => setModalState({ open: false })}
      onCloseComplete={() => reset({ children: [] })}
    >
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Edit Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack align="start">
              <VStack gap={4} w="40%">
                <FormInput<FormValues>
                  control={control}
                  name="groupId"
                  label="ID"
                  required
                  rules={{ required: true, pattern: /^[A-Za-z0-9-_]{3,}$/ }}
                  inputProps={{
                    placeholder: "must be unique, e.g. hololive-jp",
                    spellCheck: false,
                  }}
                />

                <Controller
                  control={control}
                  name="root"
                  render={({ field, fieldState, formState }) => (
                    <FormControl isInvalid={!!fieldState.error}>
                      <FormLabel htmlFor={field.name}>Root</FormLabel>
                      <Checkbox
                        ref={field.ref}
                        onBlur={field.onBlur}
                        disabled={formState.isSubmitting}
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />

                <FormInput<FormValues>
                  control={control}
                  name="nativeName"
                  label="Native name"
                  required
                  rules={{ required: true, minLength: 2 }}
                  inputProps={{
                    placeholder: "e.g. ホロライブ",
                    spellCheck: false,
                  }}
                />

                <FormInput<FormValues>
                  control={control}
                  name="englishName"
                  label="English name"
                  rules={{ minLength: 2 }}
                  inputProps={{
                    placeholder: "e.g. Hololive",
                    spellCheck: false,
                  }}
                />

                <FormInput<FormValues>
                  control={control}
                  name="japaneseName"
                  label="Japanese name"
                  rules={{ minLength: 3 }}
                  inputProps={{
                    placeholder: "e.g. ホロライブ",
                    spellCheck: false,
                  }}
                />
              </VStack>

              <Box w="60%">
                <Controller
                  control={control}
                  name="children"
                  render={({ field, fieldState, formState }) => (
                    <FormControl isInvalid={!!fieldState.error}>
                      <FormLabel htmlFor={field.name}>Children</FormLabel>
                      <ChildrenSelectionList
                        disabled={formState.isSubmitting}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
              </Box>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={() => setModalState({ open: false })}>
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

import { useVirtualizer } from "@tanstack/react-virtual";

const ChildrenSelectionList: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
}> = ({ value = [], onChange, disabled }) => {
  const { get } = useFetch();

  const parentRef = React.useRef<HTMLDivElement>(null);

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: () => get<Group[]>("/groups"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: vtubers = [] } = useQuery({
    queryKey: ["vtubers"],
    queryFn: () => get<VTuber[]>("/vtubers"),
    staleTime: 5 * 60 * 1000,
  });

  const [searchValue, setSearchValue] = useState("");

  const items = useMemo(() => {
    const renderVTuberCheckbox = (vtuber: VTuber) => (
      <Checkbox
        key={`vtuber:${vtuber.vtuberId}`}
        value={`vtuber:${vtuber.vtuberId}`}
      >
        <Avatar
          size="xs"
          mr="4px"
          name={vtuber.nativeName}
          src={vtuber.thumbnailUrl}
        />
        {vtuber.nativeName}
        <Text ml="4px" as="span" fontSize="md" color="gray.500">
          ({vtuber.vtuberId})
        </Text>
      </Checkbox>
    );

    const renderGroupCheckbox = (group: Group) => (
      <Checkbox key={`group:${group.groupId}`} value={`group:${group.groupId}`}>
        {group.nativeName}
        <Text ml="4px" as="span" fontSize="md" color="gray.500">
          ({group.groupId})
        </Text>
      </Checkbox>
    );

    return [
      ...value.map((id) => {
        if (id.startsWith("vtuber:")) {
          const vtuber = vtubers.find((v) => `vtuber:${v.vtuberId}` === id);
          if (!vtuber) {
            return <Checkbox value={id}>{id}</Checkbox>;
          }
          return renderVTuberCheckbox(vtuber);
        } else if (id.startsWith("group:")) {
          const group = groups.find((v) => `group:${v.groupId}` === id);
          if (!group) {
            return <Checkbox value={id}>{id}</Checkbox>;
          }
          return renderGroupCheckbox(group);
        }
        return null;
      }),
      ...groups
        .filter((g) => !value.includes(`group:${g.groupId}`))
        .filter((g) => !searchValue || g.groupId.includes(searchValue))
        .map(renderGroupCheckbox),
      ...vtubers
        .filter((v) => !value.includes(`vtuber:${v.vtuberId}`))
        .filter((v) => !searchValue || v.vtuberId.includes(searchValue))
        .map(renderVTuberCheckbox),
    ];
  }, [groups, vtubers, searchValue, value]);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
    overscan: 30,
  });

  return (
    <CheckboxGroup isDisabled={disabled} value={value} onChange={onChange}>
      <Input
        size="sm"
        placeholder="Search..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      <div ref={parentRef} style={{ height: "400px", overflowY: "auto" }}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {items[virtualItem.index]}
            </div>
          ))}
        </div>
      </div>
    </CheckboxGroup>
  );
};

export default Groups;
