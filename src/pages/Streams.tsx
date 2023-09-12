import {
  Img,
  Link,
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
import { useInfiniteQuery } from "react-query";

import FormatDate from "../components/FormatDate";
import LoadMore from "../components/LoadMore";
import { useFetch } from "../utils/fetch";
import { useLocation } from "wouter";

type Stream = {
  platformId: string;
  streamId: number;
  title: string;
  platformChannelId: string;
  vtuberId: string;
  thumbnailUrl: string;
  scheduleTime: number;
  startTime: number;
  endTime: number;
  updatedAt: number;
  status: "SCHEDULED" | "LIVE" | "ENDED";
};

const tabs = ["scheduled", "live", "ended"];

const Streams: React.FC<{ tab?: string }> = ({ tab = "ended" }) => {
  const [_, setLocation] = useLocation();

  return (
    <Tabs
      isLazy
      index={tabs.indexOf(tab)}
      onChange={(index) => setLocation(`/streams/${tabs[index]}`)}
      variant="soft-rounded"
    >
      <TabList p={2}>
        <Tab>Scheduled</Tab>
        <Tab>Live</Tab>
        <Tab>Ended</Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0}>
          <StreamsTable status="scheduled" />
        </TabPanel>
        <TabPanel p={0}>
          <StreamsTable status="live" />
        </TabPanel>
        <TabPanel p={0}>
          <StreamsTable status="ended" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

const StreamsTable: React.FC<{
  status: "scheduled" | "live" | "ended";
}> = ({ status }) => {
  const { get } = useFetch();
  const {
    data: streams,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["streams", status],
    ({ pageParam }) =>
      get<Stream[]>({
        url: "/streams",
        query: { end_at: pageParam, status },
      }),
    {
      getNextPageParam: (lastStreams) => lastStreams[23]?.updatedAt,
    }
  );

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="60px" zIndex={1000} bgColor="white">
          <Tr>
            <Th isNumeric>StreamId</Th>
            <Th width="160px">Thumbnail</Th>
            <Th>Status</Th>
            <Th isTruncated maxW="400px">
              Title
            </Th>
            <Th isNumeric>Vtuber</Th>
            <Th>Schedule Time</Th>
            <Th>Start Time</Th>
            <Th>End Time</Th>
            <Th>Updated</Th>
          </Tr>
        </Thead>
        <Tbody>
          {streams?.pages.map((streams, index) => (
            <Fragment key={index}>
              {streams.map((stream) => (
                <Tr key={stream.streamId}>
                  <Td isNumeric>
                    <Link
                      target="_blank"
                      href={"https://vt.poi.cat/stream/" + stream.streamId}
                    >
                      {stream.streamId}
                    </Link>
                  </Td>
                  <Td width="160px">
                    {stream.thumbnailUrl && (
                      <Img
                        loading="lazy"
                        src={stream.thumbnailUrl}
                        aspectRatio="16/9"
                        minW="100px"
                        borderRadius=".25rem"
                      />
                    )}
                  </Td>
                  <Td>
                    <StreamStatus stream={stream} />
                  </Td>
                  <Td isTruncated maxW="400px">
                    <Link
                      target="_blank"
                      href={"https://youtu.be/" + stream.platformId}
                      title={stream.title}
                    >
                      {stream.title}
                    </Link>
                  </Td>
                  <Td isNumeric>{stream.vtuberId}</Td>
                  <Td>
                    <FormatDate>{stream.scheduleTime}</FormatDate>
                  </Td>
                  <Td>
                    <FormatDate>{stream.startTime}</FormatDate>
                  </Td>
                  <Td>
                    <FormatDate>{stream.endTime}</FormatDate>
                  </Td>
                  <Td>
                    <FormatDate>{stream.updatedAt}</FormatDate>
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

const StreamStatus: React.FC<{ stream: Stream }> = ({ stream }) => {
  switch (stream.status) {
    case "SCHEDULED": {
      return <Tag>Scheduled</Tag>;
    }

    case "LIVE": {
      return <Tag colorScheme="red">Live</Tag>;
    }

    case "ENDED": {
      return <Tag colorScheme="green">Ended</Tag>;
    }

    default:
      return null;
  }
};

export default Streams;
