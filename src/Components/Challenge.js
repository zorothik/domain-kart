import React, { useState, useCallback, useMemo } from 'react';
import { isDomainAvailable } from './Resources';

const DomainItem = ({ domain, available, onDelete }) => {
  const statusColor = available ? 'green' : available === false ? 'red' : 'gray';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span>{domain}</span>
      <span style={{ color: statusColor }}>
        {available ? 'Available' : available === false ? 'Unavailable' : 'Checking...'}
      </span>
      <button style={{ marginLeft: 'auto' }} onClick={() => onDelete(domain)}>Delete</button>
    </div>
  );
};

const Challenge = ({ numDomainsRequired = 5 }) => {
  const [domainInput, setDomainInput] = useState('');
  const [domains, setDomains] = useState([]);
  const [domainAvailability, setDomainAvailability] = useState({});

  console.log("Challenge component is rendering"); // Debugging render

  // Add Domain
  const addDomain = useCallback(async () => {
    const trimmedDomain = domainInput.trim().toLowerCase();
    const domainRegex = /^(?!-)[a-z0-9-]{1,63}(?<!-)\.[a-z]{2,6}$/;
    const allowedExtensions = ['.com', '.xyz', '.app'];

    if (!domainRegex.test(trimmedDomain) || !allowedExtensions.some(ext => trimmedDomain.endsWith(ext))) {
      alert('Enter a valid domain (e.g., example.com, example.xyz, example.app).');
      return;
    }

    if (domains.includes(trimmedDomain)) {
      alert(`${trimmedDomain} is already added.`);
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
      alert('Failed to check domain availability.');
    }
  }, [domainInput, domains]);

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
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '5px' }}>
      <div style={{ marginBottom: '10px' }}>
        <input
          placeholder="Enter domain name (e.g., example.com)"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDomain(); } }}
          style={{ padding: '5px', marginRight: '5px' }}
        />
        <button onClick={addDomain}>Add Domain</button>
      </div>
      <div>
        {domains.map((domain) => (
          <DomainItem key={domain} domain={domain} available={domainAvailability[domain]} onDelete={deleteDomain} />
        ))}
      </div>
      <p>
        {availableCount} of {numDomainsRequired} domains added ({totalCount > numDomainsRequired ? 'Too many!' : 'Need more'})
      </p>
      <button disabled={!canPurchase} style={{ backgroundColor: canPurchase ? 'green' : 'gray', color: 'white', padding: '5px 10px' }}>Purchase Domains</button>
      <div style={{ marginTop: '10px' }}>
        <button onClick={clearCart}>Clear Cart</button>
        <button onClick={removeUnavailable} style={{ marginLeft: '5px' }}>Remove Unavailable</button>
        <button onClick={keepBestDomains} style={{ marginLeft: '5px' }}>Keep Best Domains</button>
      </div>
    </div>
  );
};

export default Challenge;
