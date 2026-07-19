import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import {
  Badge,
  Box,
  Container,
  Heading,
  HStack,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Tooltip,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { Layout } from "@/components/Layout";
import { Markdown } from "@/components/Markdown";
import { AuthorsMetadata } from "@/components/AuthorsMetadata";
import { CopyToClipboard } from "@/components/CopyToClipboard";
import {
  EIPStatus,
  convertMetadataToJson,
  extractMetadata,
  getBaseUrl,
} from "@/utils";

const readGip = (no: string) => {
  if (!/^\d+$/.test(no)) return null;

  const num = String(parseInt(no, 10));
  const filePath = path.join(process.cwd(), "public", "gips", `gip-${num}.md`);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const { metadata, markdown } = extractMetadata(content);
  const meta = convertMetadataToJson(metadata);

  return { meta, markdown };
};

export default async function GIPPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const { no } = await params;
  const gip = readGip(no);
  if (!gip) notFound();

  const { meta, markdown } = gip;
  const status = meta.status || "Draft";
  const statusConfig = EIPStatus[status];
  const gipLabel = `GIP-${String(parseInt(no, 10)).padStart(3, "0")}`;
  const num = String(parseInt(no, 10));
  const markdownFileURL = `${getBaseUrl()}/gips/gip-${num}.md`;
  const prNo = meta["pr" as keyof typeof meta] as string | undefined;
  const prUrl = prNo
    ? `https://github.com/gridtokenx/gips/pull/${prNo}`
    : undefined;

  return (
    <Layout>
      <Box as="main" px={{ base: 4, md: 6, lg: 10 }} py={{ base: 8, md: 10 }}>
        <Container maxW="container.lg" px={0}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Link
                href="/gips"
                color="primary.400"
                fontSize="sm"
                fontWeight="medium"
                _hover={{ textDecoration: "underline" }}
              >
                ← All GIPs
              </Link>
              <HStack mt={3} spacing={3} align="center" flexWrap="wrap">
                <Heading size={{ base: "lg", md: "xl" }}>
                  {gipLabel}
                </Heading>
                <Badge
                  px={2.5}
                  py={1}
                  bg={statusConfig?.bg ?? "bg.emphasis"}
                  color="white"
                  fontWeight={600}
                  rounded="md"
                >
                  {statusConfig?.prefix ? `${statusConfig.prefix} ` : ""}
                  {status}
                </Badge>
              </HStack>
              <Text mt={2} color="text.secondary" fontSize={{ base: "md", md: "lg" }}>
                {meta.title}
              </Text>
              {statusConfig?.description && (
                <Text mt={2} color="text.tertiary" fontSize="sm">
                  {statusConfig.description}
                </Text>
              )}
            </Box>

            <Box
              border="1px solid"
              borderColor="border.default"
              bg="bg.subtle"
              rounded="lg"
              overflow="hidden"
            >
              <Table
                variant="simple"
                sx={{
                  "tr:last-of-type > th, tr:last-of-type > td": {
                    borderBottom: 0,
                  },
                }}
              >
                <Tbody>
                {meta.author && meta.author.length > 0 && (
                  <Tr>
                    <Th>Authors</Th>
                    <Td>
                      <AuthorsMetadata authors={meta.author} />
                    </Td>
                  </Tr>
                )}
                {meta.created && (
                  <Tr>
                    <Th>Created</Th>
                    <Td>{meta.created}</Td>
                  </Tr>
                )}
                {meta["discussions-to"] && (
                  <Tr>
                    <Th>Discussion Link</Th>
                    <Td>
                      <Link
                        href={meta["discussions-to"]}
                        color="primary.400"
                        isExternal
                      >
                        {meta["discussions-to"]}
                      </Link>
                    </Td>
                  </Tr>
                )}
                <Tr>
                  <Th>
                    <HStack>
                      <Text>Markdown</Text>
                      <CopyToClipboard
                        textToCopy={markdownFileURL}
                        labelText=""
                        size={"xs"}
                      />
                    </HStack>
                  </Th>
                  <Td>
                    <Tooltip label={markdownFileURL}>
                      <Link href={markdownFileURL} color="primary.400" isExternal>
                        {markdownFileURL.length > 50
                          ? `${markdownFileURL.substring(0, 50)}...`
                          : markdownFileURL}
                      </Link>
                    </Tooltip>
                  </Td>
                </Tr>
                {prNo && prUrl && (
                  <Tr>
                    <Th>Pull Request</Th>
                    <Td>
                      <Link href={prUrl} color="primary.400" isExternal>
                        #{prNo}
                      </Link>
                    </Td>
                  </Tr>
                )}
                </Tbody>
              </Table>
            </Box>

            <Box
              border="1px solid"
              borderColor="border.default"
              bg="bg.subtle"
              rounded="lg"
              p={{ base: 4, md: 6 }}
            >
              <Markdown md={markdown} markdownFileURL={markdownFileURL} />
            </Box>
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
}
