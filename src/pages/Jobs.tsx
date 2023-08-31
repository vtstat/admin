import {
  Button,
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
import { useInfiniteQuery, useMutation } from "react-query";

import FormatDate from "../components/FormatDate";
import LoadMore from "../components/LoadMore";
import { client } from "../main";
import { useFetch } from "../utils/fetch";

type Job = {
  job_id: number;
  continuation: null;
  status: "Success" | string;
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

const Jobs: React.FC = () => (
  <Tabs isLazy defaultIndex={2} variant="soft-rounded">
    <TabList p={2}>
      <Tab>Queued</Tab>
      <Tab>Running</Tab>
      <Tab>Success</Tab>
      <Tab>Failed</Tab>
    </TabList>

    <TabPanels>
      <TabPanel p={0}>
        <JobsTable status="queued" />
      </TabPanel>
      <TabPanel p={0}>
        <JobsTable status="running" />
      </TabPanel>
      <TabPanel p={0}>
        <JobsTable status="success" />
      </TabPanel>
      <TabPanel p={0}>
        <JobsTable status="failed" />
      </TabPanel>
    </TabPanels>
  </Tabs>
);

const JobsTable: React.FC<{
  status: "queued" | "running" | "success" | "failed";
}> = ({ status }) => {
  const { get } = useFetch();
  const {
    data: jobs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["jobs", status],
    ({ pageParam }) =>
      get<Job[]>({
        url: "/jobs",
        query: { end_at: pageParam, status },
      }),
    {
      getNextPageParam: (lastJobs) => lastJobs[23]?.updated_at,
    }
  );

  return (
    <TableContainer overflowX="unset" overflowY="unset">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead position="sticky" top="60px" zIndex={1000} bgColor="white">
          <Tr>
            <Th isNumeric>ID</Th>
            <Th>Status</Th>
            <Th>Last Run</Th>
            <Th>Next Run</Th>
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
                  <Td>
                    {job.last_run ? (
                      <FormatDate>{job.last_run}</FormatDate>
                    ) : (
                      "N/A"
                    )}
                  </Td>
                  <Td>
                    {job.next_run ? (
                      <FormatDate>{job.next_run}</FormatDate>
                    ) : (
                      "N/A"
                    )}
                  </Td>
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
      {entries.map(([key, value]) => (
        <Tag variant="outline" key={key}>
          {key}: {value}
        </Tag>
      ))}
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

    case "QUEUED": {
      return <Tag colorScheme="gray">Queued</Tag>;
    }

    default:
      return null;
  }
};

const JobKind: React.FC<{ kind: string }> = ({ kind }) => {
  switch (kind) {
    case "SendNotification": {
      return <Tag colorScheme="telegram">Send Notification</Tag>;
    }

    case "UpsertYoutubeStream": {
      return <Tag colorScheme="orange">Upsert YouTube Stream</Tag>;
    }

    default: {
      return <Tag>{kind}</Tag>;
    }
  }
};

const ReRuneButton: React.FC<{ job: Job }> = ({ job }) => {
  const { post } = useFetch();

  const { mutate, isLoading } = useMutation(
    () => post(`/jobs/${job.job_id}/re_run`, null),
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
