import moment from "moment";
function groupedMessagesByDate(messages) {
  const grouped = {};

  messages.forEach((msg) => {
    const msgDate = moment(msg?.createdAt);
    let dateKey;

    if (msgDate.isSame(moment(), "day")) {
      dateKey = "Today";
    } else if (msgDate.isSame(moment().subtract(1, "day"), "day")) {
      dateKey = "Yesterday";
    } else {
      dateKey = msgDate.format("DD MMM YYYY"); // Example: "02 Feb 2025"
    }

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(msg);
  });

  return grouped;
}
export default groupedMessagesByDate;
