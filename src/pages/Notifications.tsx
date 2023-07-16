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

type Notification = {
  notification_id: number;
  payload: {
    vtuber_id: string;
    stream_id: number;
    message_id: string;
  };
  created_at: string;
  updated_at: string;
};

const Notifications: React.FC = () => {
  const { data: notifications = [] } = useQuery(["notifications"], () =>
    fetch<Notification[]>("/notifications")
  );

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="0" zIndex={1000} bgColor="white">
          <Tr>
            <Th isNumeric>ID</Th>

            <Th>Vtuber ID</Th>
            <Th>Stream ID</Th>
            <Th>Message ID</Th>

            <Th>Created</Th>
            <Th>Updated</Th>
          </Tr>
        </Thead>
        <Tbody>
          {notifications.map((notification) => (
            <Tr key={notification.notification_id}>
              <Td isNumeric>{notification.notification_id}</Td>

              <Td>{notification.payload.vtuber_id}</Td>
              <Td>{notification.payload.stream_id}</Td>
              <Td>{notification.payload.message_id}</Td>

              <Td>
                <FormatDate>{notification.created_at}</FormatDate>
              </Td>
              <Td>
                <FormatDate>{notification.updated_at}</FormatDate>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default Notifications;
