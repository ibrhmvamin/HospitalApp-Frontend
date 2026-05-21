const formatDate = (dateString) => {
  if (!dateString || typeof dateString !== "string") {
    return { date: "Invalid", time: "Invalid" };
  }

  const [datePart, timePart] = dateString.split(" ");

  if (!datePart || !timePart) {
    return { date: "Invalid", time: "Invalid" };
  }

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
