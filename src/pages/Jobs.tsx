import {
  Box,
  Button,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Stack,
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
import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useMutation,
} from "react-query";
import { useLocation } from "wouter";

import FormatDate from "../components/FormatDate";
import LoadMore from "../components/LoadMore";
import { client } from "../main";
import { useFetch } from "../utils/fetch";

const tabs = ["queued", "running", "success", "failed"];

const Jobs: React.FC<{ tab?: string }> = ({ tab = "success" }) => {
  const [_, setLocation] = useLocation();
  const { get } = useFetch();
  const result = useInfiniteQuery(
    ["jobs", tab],
    ({ pageParam }) =>
      get<Job[]>({
        url: "/jobs",
        query: { end_at: pageParam, status: tab },
      }),
    {
      getNextPageParam: (lastJobs) => lastJobs[23]?.updated_at,
      staleTime: 1000,
    }
  );

  return (
    <Tabs
      isLazy
      index={tabs.indexOf(tab)}
      onChange={(index) => setLocation(`/jobs/${tabs[index]}`)}
      variant="soft-rounded"
    >
      <TabList p={2}>
        <Tab>Queued</Tab>
        <Tab>Running</Tab>
        <Tab>Success</Tab>
        <Tab>Failed</Tab>

        <Stack
          w="full"
          align="center"
          justify="end"
          direction="row"
          spacing={4}
          px="4"
        >
          <Box>
            Total:{" "}
            {result.data?.pages.reduce((acc, page) => acc + page.length, 0)}
            {result.hasNextPage && "+"}
          </Box>
          <Button
            colorScheme="teal"
            variant="link"
            onClick={() => result.refetch()}
          >
            Refresh
          </Button>
        </Stack>
      </TabList>

      <TabPanels>
        <TabPanel p={0}>
          <JobsTable result={result} status="queued" />
        </TabPanel>
        <TabPanel p={0}>
          <JobsTable result={result} status="running" />
        </TabPanel>
        <TabPanel p={0}>
          <JobsTable result={result} status="success" />
        </TabPanel>
        <TabPanel p={0}>
          <JobsTable result={result} status="failed" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

type Job = {
  job_id: number;
  continuation: null;
  status: string;
  created_at: number;
  last_run: number | null;
  next_run: number | null;
  kind: string;
  payload: {
    vtuber_id: string;
    channel_id: number;
    platform_stream_id: string;
  };
  updated_at: number;
};

const JobsTable: React.FC<{
  result: UseInfiniteQueryResult<Job[]>;
  status: "queued" | "running" | "success" | "failed";
}> = ({ status, result }) => {
  const { data: jobs, fetchNextPage, hasNextPage, isFetchingNextPage } = result;

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="60px" zIndex={1000} bgColor="white">
          <Tr>
            <Th isNumeric>ID</Th>
            <Th>Status</Th>
            {(status === "failed" || status === "success") && <Th>Last Run</Th>}
            {status === "queued" && <Th>Next Run</Th>}
            {status === "running" && <Th>Start at</Th>}
            <Th>Kind</Th>
            <Th>Payload</Th>
            <Th>Created</Th>
            <Th>Updated</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {jobs?.pages.map((jobs, index) => (
            <Fragment key={index}>
              {jobs.map((job) => (
                <Tr key={job.job_id}>
                  <Td isNumeric>{job.job_id}</Td>
                  <Td>
                    <JobsStatus job={job} />
                  </Td>
                  {(status === "failed" || status === "success") && (
                    <Td>
                      {job.last_run ? (
                        <FormatDate>{job.last_run}</FormatDate>
                      ) : (
                        "N/A"
                      )}
                    </Td>
                  )}
                  {(status === "queued" || status === "running") && (
                    <Td>
                      {job.next_run ? (
                        <FormatDate>{job.next_run}</FormatDate>
                      ) : (
                        "N/A"
                      )}
                    </Td>
                  )}
                  <Td>
                    <JobKind kind={job.kind} />
                  </Td>
                  <Td>
                    {job.payload && typeof job.payload === "object" && (
                      <JobsPayload payload={job.payload} />
                    )}
                  </Td>
                  <Td>
                    <FormatDate>{job.created_at}</FormatDate>
                  </Td>
                  <Td>
                    <FormatDate>{job.updated_at}</FormatDate>
                  </Td>
                  <Td>
                    <ReRuneButton job={job} />
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

const JobsPayload: React.FC<{ payload: Job["payload"] }> = ({ payload }) => {
  const entries = Object.entries(payload).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <Stack direction="row" spacing={4}>
      {entries.map(([key, value]) => {
        if (key === "stream_id") {
          return (
            <Tag variant="outline" key={key}>
              {key}:{"  "}
              <Link target="_blank" href={`https://vt.poi.cat/stream/${value}`}>
                {value}
              </Link>
            </Tag>
          );
        }

        return (
          <Tag variant="outline" key={key}>
            {key}: {value}
          </Tag>
        );
      })}
    </Stack>
  );
};

const JobsStatus: React.FC<{ job: Job }> = ({ job }) => {
  switch (job.status) {
    case "SUCCESS": {
      return <Tag colorScheme="green">Success</Tag>;
    }

    case "FAILED": {
      return <Tag colorScheme="red">Failed</Tag>;
    }

    case "RUNNING": {
      return <Tag colorScheme="blue">Running</Tag>;
    }

    case "QUEUED": {
      return <Tag colorScheme="gray">Queued</Tag>;
    }

    default:
      return null;
  }
};

const JobKind: React.FC<{ kind: string }> = ({ kind }) => {
  switch (kind) {
    case "SEND_NOTIFICATION": {
      return <Tag colorScheme="telegram">SendNotification</Tag>;
    }

    case "COLLECT_YOUTUBE_STREAM_METADATA": {
      return <Tag colorScheme="red">CollectYouTubeStreamStats</Tag>;
    }

    case "COLLECT_TWITCH_STREAM_METADATA": {
      return <Tag colorScheme="purple">CollectTwitchStreamStats</Tag>;
    }

    case "SUBSCRIBE_YOUTUBE_PUBSUB": {
      return <Tag colorScheme="facebook">SubscriberYouTubePubSub</Tag>;
    }

    case "UPDATE_CHANNEL_STATS": {
      return <Tag colorScheme="linkedin">CollectChannelStats</Tag>;
    }

    default: {
      return <Tag>{kind}</Tag>;
    }
  }
};

const ReRuneButton: React.FC<{ job: Job }> = ({ job }) => {
  const { post } = useFetch();

  const { mutate, isLoading } = useMutation(
    () => post(`/jobs/re-run`, { jobId: job.job_id }),
    {
      onSuccess: () => {
        client.refetchQueries(["jobs"]);
      },
    }
  );

  return (
    <Popover isLazy>
      <PopoverTrigger>
        <Button colorScheme="teal" variant="link">
          Re-run
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold">Confirmation</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>Are you sure you want to re-run this job?</PopoverBody>
        <PopoverFooter display="flex" justifyContent="flex-end">
          <Button
            size="sm"
            colorScheme="green"
            loadingText="Applying"
            isLoading={isLoading}
            onClick={() => mutate()}
          >
            Apply
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default Jobs;
