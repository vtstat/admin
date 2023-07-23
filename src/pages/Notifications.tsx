import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { Fragment } from "react";
import { useInfiniteQuery } from "react-query";

import FormatDate from "../components/FormatDate";
import { fetch } from "../utils/fetch";
import LoadMore from "../components/LoadMore";

type Notification = {
  notification_id: number;
  payload: {
    vtuber_id: string;
    stream_id: number;
    message_id: string;
  };
  created_at: number;
  updated_at: number;
};

const Notifications: React.FC = () => {
  const {
    data: notifications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["notifications"],
    ({ pageParam }) =>
      fetch<Notification[]>({
        url: "/notifications",
        query: { end_at: pageParam },
      }),
    {
      getNextPageParam: (lastStreams) => lastStreams[23]?.updated_at,
    }
  );

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="60px" zIndex={1000} bgColor="white">
          <Tr>
            <Th isNumeric>ID</Th>

            <Th>Vtuber ID</Th>
            <Th isNumeric>Stream ID</Th>
            <Th isNumeric>Message ID</Th>

            <Th>Created</Th>
            <Th>Updated</Th>
          </Tr>
        </Thead>
        <Tbody>
          {notifications?.pages.map((notifications, index) => (
            <Fragment key={index}>
              {notifications.map((notification) => (
                <Tr key={notification.notification_id}>
                  <Td isNumeric>{notification.notification_id}</Td>

                  <Td>{notification.payload.vtuber_id}</Td>
                  <Td isNumeric>{notification.payload.stream_id}</Td>
                  <Td isNumeric>{notification.payload.message_id}</Td>

                  <Td>
                    <FormatDate>{notification.created_at}</FormatDate>
                  </Td>
                  <Td>
                    <FormatDate>{notification.updated_at}</FormatDate>
                  </Td>
                </Tr>
              ))}
            </Fragment>
          ))}
        </Tbody>
      </Table>

      {hasNextPage && (
        <LoadMore
          onReach={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        />
      )}
    </TableContainer>
  );
};

export default Notifications;
