const formatDate = (dateString) => {
  const [datePart, timePart] = dateString.split(" ");

  const [day, month, year] = datePart.split("-");

  const dateObj = new Date(`${year}-${month}-${day}T${timePart}`);

  const options = { day: "numeric", month: "short", year: "numeric" };

  const formattedDate = dateObj.toLocaleDateString("en-GB", options);

  const formattedTime = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Baku",
  });

  return {
    date: formattedDate,
    time: formattedTime,
  };
};

export default formatDate;
