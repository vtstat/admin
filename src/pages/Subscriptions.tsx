import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { Fragment } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import { useLocation } from "wouter";

import FormatDate from "../components/FormatDate";
import LoadMore from "../components/LoadMore";

import { useFetch } from "../utils/fetch";

const tabs = ["subscriptions", "notifications"];

const Subscriptions: React.FC<{ tab?: string }> = ({
  tab = "subscriptions",
}) => {
  const [_, setLocation] = useLocation();

  return (
    <Tabs
      isLazy
      index={tabs.indexOf(tab)}
      onChange={(index) => setLocation(`/subscriptions/${tabs[index]}`)}
      variant="soft-rounded"
    >
      <TabList p={2}>
        <Tab>Subscriptions</Tab>
        <Tab>Notifications</Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0}>
          <SubscriptionsList />
        </TabPanel>
        <TabPanel p={0}>
          <NotificationsList />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

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

const SubscriptionsList: React.FC = () => {
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

const NotificationsList: React.FC = () => {
  const { get } = useFetch();
  const {
    data: notifications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["notifications"],
    ({ pageParam }) =>
      get<Notification[]>({
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

export default Subscriptions;
