import { Box } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import React from "react";
import { Redirect, Route, Switch } from "wouter";

import { credentialAtom } from "./atoms";
import Nav from "./components/Nav";
import Channels from "./pages/Channels";
import Jobs from "./pages/Jobs";
import Notifications from "./pages/Notifications";
import SignIn from "./pages/SignIn";
import Streams from "./pages/Streams";
import Subscriptions from "./pages/Subscriptions";
import Vtubers from "./pages/VTubers";

const App: React.FC = () => {
  const credential = useAtomValue(credentialAtom);

  if (!credential) return <SignIn />;

  return (
    <>
      <Nav />

      <Box overflowX="auto" height="calc(100vh - 61px)">
        <Switch>
          <Route path="/jobs" component={Jobs} />
          <Route path="/streams" component={Streams} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/vtubers" component={Vtubers} />
          <Route path="/subscriptions" component={Subscriptions} />
          <Route path="/channels" component={Channels} />
          <Route path="/" children={<Redirect to="/jobs" />} />
        </Switch>
      </Box>
    </>
  );
};

export default App;
