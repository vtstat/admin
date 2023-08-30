import {
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Link,
} from "@chakra-ui/react";
import React from "react";
import { useQuery } from "react-query";

import { useFetch } from "../utils/fetch";

type Channel = {
  channelId: number;
  platformId: string;
  vtuberId: string;
  platform: string;
};

const Channels: React.FC = () => {
  const { get } = useFetch();
  const { data: channels = [] } = useQuery(["channels"], () =>
    get<Channel[]>("/channels")
  );

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="60px" zIndex={1000} bgColor="white">
          <Tr>
            <Th>ID</Th>
            <Th>VTuber Id</Th>
            <Th>Platform</Th>
            <Th>Platform Id</Th>
          </Tr>
        </Thead>
        <Tbody>
          {channels.map((job) => (
            <Tr key={job.channelId}>
              <Td>{job.channelId}</Td>
              <Td>{job.vtuberId}</Td>
              <Td>
                <PlatformTag>{job.platform}</PlatformTag>
              </Td>
              <Td>
                <Link
                  target="_blank"
                  href={"https://www.youtube.com/channel/" + job.platformId}
                >
                  {job.platformId}
                </Link>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

const PlatformTag: React.FC<{ children: string }> = ({ children }) => {
  switch (children) {
    case "Youtube": {
      return <Tag colorScheme="red">YouTube</Tag>;
    }

    default: {
      return <Tag>{children}</Tag>;
    }
  }
};

export default Channels;
