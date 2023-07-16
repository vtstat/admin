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
import FormatDate from "../components/FormatDate";

import { fetch } from "../utils/fetch";

type Subscription = {
  subscription_id: number;
  payload: {
    vtuber_id: string;
    channel_id: string;
  };
  updated_at: string | null;
  created_at: string | null;
};

const Subscriptions: React.FC = () => {
  const { data: subscriptions = [] } = useQuery(["subscriptions"], () =>
    fetch<Subscription[]>("/subscriptions")
  );

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="60px" zIndex={1000} bgColor="white">
          <Tr>
            <Th isNumeric>ID</Th>
            <Th>Channel ID</Th>
            <Th>VTuber Id</Th>
            <Th>Created</Th>
            <Th>Updated</Th>
          </Tr>
        </Thead>
        <Tbody>
          {subscriptions.map((subscription) => (
            <Tr key={subscription.subscription_id}>
              <Td isNumeric>{subscription.subscription_id}</Td>
              <Td>{subscription.payload.channel_id}</Td>
              <Td>{subscription.payload.vtuber_id}</Td>
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
