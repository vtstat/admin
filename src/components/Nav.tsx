import {
  Box,
  Flex,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { Link as ReachLink, useLocation } from "wouter";

type Props = {};

const MENUS = [
  "jobs",
  "streams",
  "notifications",
  "vtubers",
  "subscriptions",
  "channels",
];

const Nav: React.FC<Props> = ({}) => {
  const [location] = useLocation();

  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");

  return (
    <Flex
      bg={useColorModeValue("white", "gray.800")}
      color={useColorModeValue("gray.600", "white")}
      h={"60px"}
      py={{ base: 2 }}
      px={{ base: 4 }}
      borderBottom={1}
      borderStyle={"solid"}
      borderColor={useColorModeValue("gray.200", "gray.900")}
      alignItems="center"
      position="fixed"
      left={0}
      right={0}
      top={0}
      zIndex={2434}
    >
      <Text
        as="b"
        textAlign={"left"}
        fontFamily={"heading"}
        color={useColorModeValue("gray.800", "white")}
      >
        vtstat
      </Text>

      <Box flex={1} />

      <Stack direction="row" overflowX="auto" spacing={0}>
        {MENUS.map((menu) => (
          <Link
            key={menu}
            as={ReachLink}
            p={2}
            href={"/" + menu}
            fontSize={"sm"}
            fontWeight={500}
            color={location.startsWith("/" + menu) ? "pink.400" : linkColor}
            _hover={{
              textDecoration: "none",
              color: linkHoverColor,
            }}
          >
            {menu}
          </Link>
        ))}
      </Stack>
    </Flex>
  );
};

export default Nav;
