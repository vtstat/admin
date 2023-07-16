import { Box } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import React, { lazy } from "react";
import { Redirect, Route, Switch } from "wouter";

import { credentialValidAtom } from "./atoms";
import Nav from "./components/Nav";

const Channels = lazy(() => import("./pages/Channels"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Streams = lazy(() => import("./pages/Streams"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Vtubers = lazy(() => import("./pages/VTubers"));

const App: React.FC = () => {
  const credentialValid = useAtomValue(credentialValidAtom);

  if (!credentialValid) return <SignIn />;

  return (
    <>
      <Nav />

      <Box mt="60px">
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
