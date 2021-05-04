export default (timezone: string) => {
  if (!timezone) {
    return '';
  }

  return timezone
    .replace(/_/g, ' ')
    .replace(/\//, ' - ')
    .replace(/\//g, ', ');
};
