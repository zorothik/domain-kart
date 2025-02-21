export async function isDomainAvailable(domain) {
  try {
    console.log(`http://localhost:5000/check-domain?domain=${domain}`)
    const response = await fetch(`http://localhost:5000/check-domain?domain=${domain}`);
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Error checking domain availability:', error);
    return false;
  }
}
