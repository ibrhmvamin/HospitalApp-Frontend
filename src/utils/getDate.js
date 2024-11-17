export default dateString => {
  const [day, month, year, hours, minutes] = dateString
    .match(/\d+/g)
    .map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};
