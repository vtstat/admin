import {
  Button,
  Progress,
  Stack,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { getUnixTime, parseISO } from "date-fns";
import React, { Fragment } from "react";
import { useInfiniteQuery } from "react-query";

import FormatDate from "../components/FormatDate";
import { fetch } from "../utils/fetch";

type Job = {
  job_id: number;
  continuation: null;
  status: "Success" | string;
  created_at: string;
  last_run: string | null;
  next_run: string | null;
  kind: string;
  payload: {
    vtuber_id: string;
    channel_id: number;
    platform_stream_id: string;
  };
  updated_at: string;
};

const Jobs: React.FC = ({}) => {
  const {
    data: jobs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["jobs"],
    ({ pageParam }) =>
      fetch<Job[]>({
        url: "/jobs",
        query: { end_at: pageParam },
      }),
    {
      getNextPageParam: (lastJobs) => {
        const last = lastJobs[23]?.updated_at;
        if (last) return getUnixTime(parseISO(last));
      },
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
                    <FormatDate>{job.last_run}</FormatDate>
                  </Td>
                  <Td>
                    <FormatDate>{job.next_run}</FormatDate>
                  </Td>
                  <Td>{job.kind}</Td>
                  <Td>
                    <JobsPayload payload={job.payload} />
                  </Td>
                  <Td>
                    <FormatDate>{job.created_at}</FormatDate>
                  </Td>
                  <Td>
                    <FormatDate>{job.updated_at}</FormatDate>
                  </Td>
                  <Td>
                    <Button colorScheme="teal" variant="link">
                      Re-run
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Fragment>
          ))}
        </Tbody>

        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
            ? "Load More"
            : "Nothing more to load"}
        </button>
      </Table>

      <Progress size="xs" isIndeterminate />
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
    case "Success": {
      return <Tag colorScheme="green">Success</Tag>;
    }

    case "Failed": {
      return <Tag colorScheme="red">Failed</Tag>;
    }

    default:
      return null;
  }
};

export default Jobs;
