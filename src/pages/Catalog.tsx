import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React from "react";
import { useLocation } from "wouter";

import VTubers from "./VTubers";
import Channels from "./Channels";
import Groups from "./Groups";

const tabs = ["groups", "vtubers", "channels"];

const Catalog: React.FC<{ tab?: string }> = ({ tab = "vtubers" }) => {
  const [_, setLocation] = useLocation();

  return (
    <Tabs
      isLazy
      index={tabs.indexOf(tab)}
      onChange={(index) => setLocation(`/catalog/${tabs[index]}`)}
      variant="soft-rounded"
    >
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
