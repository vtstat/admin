import {
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import { useQuery } from "react-query";
import FormatDate from "../components/FormatDate";

import { useFetch } from "../utils/fetch";

type Subscription = {
  subscription_id: number;
  payload: {
    vtuber_id: string;
    guild_id: string;
    channel_id: string;
  };
  updated_at: number | null;
  created_at: number | null;
};

const Subscriptions: React.FC = () => {
  const { get } = useFetch();
  const { data: subscriptions = [] } = useQuery(["subscriptions"], () =>
    get<Subscription[]>("/subscriptions")
  );

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="60px" zIndex={1000} bgColor="white">
          <Tr>
            <Th isNumeric>ID</Th>
            <Th isNumeric>Kind</Th>
            <Th isNumeric>Guild ID</Th>
            <Th isNumeric>Channel ID</Th>
            <Th isNumeric>VTuber Id</Th>
            <Th>Created</Th>
            <Th>Updated</Th>
          </Tr>
        </Thead>
        <Tbody>
          {subscriptions.map((subscription) => (
            <Tr key={subscription.subscription_id}>
              <Td isNumeric>{subscription.subscription_id}</Td>
              <Td isNumeric>
                <Tag colorScheme="telegram">Discord</Tag>
              </Td>
              <Td isNumeric>{subscription.payload.guild_id}</Td>
              <Td isNumeric>{subscription.payload.channel_id}</Td>
              <Td isNumeric>{subscription.payload.vtuber_id}</Td>
              <Td>
                <FormatDate>{subscription.created_at}</FormatDate>
              </Td>
              <Td>
                <FormatDate>{subscription.updated_at}</FormatDate>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default Subscriptions;
