import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React from "react";
import VTubers from "./VTubers";
import Channels from "./Channels";
import Groups from "./Groups";

type Props = {};

const Catalog: React.FC<Props> = ({}) => {
  return (
    <Tabs isLazy defaultIndex={2} variant="soft-rounded">
      <TabList p={2}>
        <Tab>Groups</Tab>
        <Tab>VTubers</Tab>
        <Tab>Channels</Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0}>
          <Groups />
        </TabPanel>
        <TabPanel p={0}>
          <VTubers />
        </TabPanel>
        <TabPanel p={0}>
          <Channels />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Catalog;
