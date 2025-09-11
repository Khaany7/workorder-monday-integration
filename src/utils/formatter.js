function formatWorkOrderData(rawData) {
  // Example: capitalize address, format date, etc.
  return {
    ...rawData,
    address: rawData.address ? rawData.address.trim() : '',
    date: rawData.date ? new Date(rawData.date).toISOString().split('T')[0] : ''
  };
}

module.exports = { formatWorkOrderData };