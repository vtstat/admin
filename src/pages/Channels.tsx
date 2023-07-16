import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import { useQuery } from "react-query";

import { fetch } from "../utils/fetch";

type Props = {};

type Channel = {
  channel_id: number;
  platform_id: string;
  vtuber_id: string;
};

const Channels: React.FC<Props> = ({}) => {
  const { data: channels = [] } = useQuery(["channels"], () =>
    fetch<Channel[]>("/channels")
  );

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="0" zIndex={1000} bgColor="white">
          <Tr>
            <Th isNumeric>ID</Th>
            <Th>Platform Id</Th>
            <Th>VTuber Id</Th>
          </Tr>
        </Thead>
        <Tbody>
          {channels.map((job) => (
            <Tr key={job.channel_id}>
              <Td isNumeric>{job.channel_id}</Td>
              <Td>{job.platform_id}</Td>
              <Td>{job.vtuber_id}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default Channels;
