import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Input,
  List,
  ListItem,
  Text,
  VStack,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { isDomainAvailable } from './Resources';

const DomainItem = ({ domain, available, onDelete }) => {
  const statusColor = available ? 'green' : available === false ? 'red' : 'gray';

  return (
    <Flex w="100%" justify="space-between" align="center">
      <Text>{domain}</Text>
      <Text ml={2} color={statusColor}>
        {available ? 'Available' : available === false ? 'Unavailable' : 'Checking...'}
      </Text>
      <Button ml="auto" size="sm" onClick={() => onDelete(domain)}>
        Delete
      </Button>
    </Flex>
  );
};

const Mainapp = ({ numDomainsRequired = 5 }) => {
  const [domainInput, setDomainInput] = useState('');
  const [domains, setDomains] = useState([]);
  const [domainAvailability, setDomainAvailability] = useState({});
  const toast = useToast();
  const { hasCopied, onCopy } = useClipboard(domains.join(', '));

  console.log("Mainapp component is rendering"); // Debugging render

  // Add Domain
  const addDomain = useCallback(async () => {
    const trimmedDomain = domainInput.trim().toLowerCase();
    const domainRegex = /^(?!-)[a-z0-9-]{1,63}(?<!-)\.[a-z]{2,6}$/;
    const allowedExtensions = ['.com', '.xyz', '.app'];

    if (!domainRegex.test(trimmedDomain) || !allowedExtensions.some(ext => trimmedDomain.endsWith(ext))) {
      toast({
        title: 'Invalid Domain',
        description: 'Enter a valid domain (e.g., example.com, example.xyz, example.app).',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (domains.includes(trimmedDomain)) {
      toast({
        title: 'Duplicate Domain',
        description: `${trimmedDomain} is already added.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setDomains(prev => [...prev, trimmedDomain]);
    setDomainInput('');
    setDomainAvailability(prev => ({ ...prev, [trimmedDomain]: null }));

    try {
      const available = await isDomainAvailable(trimmedDomain);
      setDomainAvailability(prev => ({ ...prev, [trimmedDomain]: available }));
    } catch (error) {
      console.error("Error checking domain availability:", error);
      setDomainAvailability(prev => ({ ...prev, [trimmedDomain]: false }));
      toast({
        title: 'Error',
        description: 'Failed to check domain availability.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [domainInput, domains, toast]);

  // Delete Domain
  const deleteDomain = useCallback((domain) => {
    setDomains(prev => prev.filter(d => d !== domain));
    setDomainAvailability(prev => {
      const newAvailability = { ...prev };
      delete newAvailability[domain];
      return newAvailability;
    });
  }, []);

  // Clear All Domains
  const clearCart = useCallback(() => {
    setDomains([]);
    setDomainAvailability({});
  }, []);

  // Remove Unavailable Domains
  const removeUnavailable = useCallback(() => {
    setDomains(prev => prev.filter(domain => domainAvailability[domain] === true));
    setDomainAvailability(prev => Object.fromEntries(Object.entries(prev).filter(([domain]) => domainAvailability[domain] === true)));
  }, [domainAvailability]);

  // Copy Domains
  const copyDomains = useCallback(() => {
    onCopy();
    toast({
      title: 'Cart Copied',
      description: 'Domains copied to clipboard!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [onCopy, toast]);

  // Keep Best Domains
  const keepBestDomains = useCallback(() => {
    const extOrder = ['.com', '.app', '.xyz'];
    const sortedDomains = domains
      .sort((a, b) => {
        const extA = `.${a.split('.').pop()}`;
        const extB = `.${b.split('.').pop()}`;
        return extOrder.indexOf(extA) - extOrder.indexOf(extB) || a.length - b.length;
      })
      .slice(0, numDomainsRequired);

    setDomains(sortedDomains);
  }, [domains, numDomainsRequired]);

  // Available Count
  const availableCount = useMemo(() => domains.filter(domain => domainAvailability[domain] === true).length, [domains, domainAvailability]);
  const totalCount = domains.length;
  const canPurchase = totalCount === numDomainsRequired && availableCount === numDomainsRequired;

  return (
    <Card p={4} m={4}>
      <CardBody>
        <VStack spacing={4}>
          <HStack>
            <Input
              placeholder="Enter domain name (e.g., example.com)"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDomain(); } }}
            />
            <Button onClick={addDomain}>Add Domain</Button>
          </HStack>
          <List spacing={2}>
            {domains.map((domain) => (
              <ListItem key={domain}>
                <DomainItem domain={domain} available={domainAvailability[domain]} onDelete={deleteDomain} />
              </ListItem>
            ))}
          </List>
          <Text>
            {availableCount} of {numDomainsRequired} domains added ({totalCount > numDomainsRequired ? 'Too many!' : 'Need more'})
          </Text>
          <Button colorScheme="teal" isDisabled={!canPurchase}>Purchase Domains</Button>
          <HStack>
            <Button onClick={clearCart}>Clear Cart</Button>
            <Button onClick={removeUnavailable}>Remove Unavailable</Button>
            <Button onClick={copyDomains}>Copy Domains</Button>
            <Button onClick={keepBestDomains}>Keep Best Domains</Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default Mainapp;
