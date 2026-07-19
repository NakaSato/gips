"use client";

import NLink from "next/link";
import {
  Badge,
  Box,
  Container,
  HStack,
  Icon,
  Link,
  Text,
} from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiBox,
  FiCloud,
  FiExternalLink,
  FiFileText,
  FiGitBranch,
  FiGlobe,
  FiLayers,
  FiShare2,
  FiSun,
  FiZap,
} from "react-icons/fi";
import { validCAIPs } from "@/data/validCAIPs";
import { validEIPs } from "@/data/validEIPs";
import { validRIPs } from "@/data/validRIPs";
import { getProposalListItems } from "@/utils/proposals";

interface Directory {
  label: string;
  href: string;
  icon: IconType;
  count?: number;
  external?: boolean;
}

const directories: Directory[] = [
  {
    label: "EIPs",
    href: "/eips",
    count: getProposalListItems(validEIPs, "eip").length,
    icon: FiFileText,
  },
  {
    label: "ERCs",
    href: "/ercs",
    count: getProposalListItems(validEIPs, "erc").length,
    icon: FiLayers,
  },
  {
    label: "CAIPs",
    href: "/caips",
    count: getProposalListItems(validCAIPs, "caip").length,
    icon: FiBox,
  },
  {
    label: "RIPs",
    href: "/rips",
    count: getProposalListItems(validRIPs, "rip").length,
    icon: FiGitBranch,
  },
  // GridTokenX Improvement Proposals (internal — route TBD)
  {
    label: "GIPs",
    href: "/gips",
    icon: FiZap,
  },
  // External standards: P2P energy trading, renewable / carbon certificates, green direction
  {
    label: "I-REC",
    href: "https://www.trackingstandard.org",
    icon: FiSun,
    external: true,
  },
  {
    label: "Verra VCS",
    href: "https://verra.org",
    icon: FiCloud,
    external: true,
  },
  {
    label: "Gold Standard",
    href: "https://www.goldstandard.org",
    icon: FiAward,
    external: true,
  },
  {
    label: "IEEE 2030.5",
    href: "https://standards.ieee.org/ieee/2030_5/5897/",
    icon: FiShare2,
    external: true,
  },
  {
    label: "Energy Web",
    href: "https://www.energyweb.org",
    icon: FiActivity,
    external: true,
  },
  {
    label: "EU Taxonomy",
    href: "https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en",
    icon: FiGlobe,
    external: true,
  },
  {
    label: "GHG Protocol",
    href: "https://ghgprotocol.org",
    icon: FiBarChart2,
    external: true,
  },
];

export const ProposalDirectoryPills = () => {
  return (
    <Box as="section" px={{ base: 4, md: 6, lg: 10 }} pt={{ base: 6, md: 8 }}>
      <Container maxW="container.xl" px={0}>
        <HStack spacing={3} flexWrap="wrap" justify="center">
          <Text
            color="text.secondary"
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="medium"
            mr={{ base: 0, md: 1 }}
          >
            Browse all:
          </Text>
          {directories.map((directory) => (
            <Link
              key={directory.href}
              {...(directory.external
                ? { href: directory.href, isExternal: true }
                : { as: NLink, href: directory.href })}
              display="inline-flex"
              alignItems="center"
              gap={2.5}
              px={4}
              py={2.5}
              minH="2.75rem"
              border="1px solid"
              borderColor="border.default"
              bg="bg.subtle"
              color="text.primary"
              rounded="full"
              _hover={{
                bg: "bg.muted",
                borderColor: "primary.500",
                textDecoration: "none",
              }}
            >
              <Icon as={directory.icon} color="text.tertiary" boxSize={4} />
              <Text fontWeight="semibold">{directory.label}</Text>
              {directory.count !== undefined && (
                <Badge
                  bg="bg.emphasis"
                  color="text.secondary"
                  rounded="full"
                  px={2}
                  py={0.5}
                >
                  {directory.count}
                </Badge>
              )}
              {directory.external && (
                <Icon
                  as={FiExternalLink}
                  color="text.tertiary"
                  boxSize={3.5}
                />
              )}
            </Link>
          ))}
        </HStack>
      </Container>
    </Box>
  );
};
