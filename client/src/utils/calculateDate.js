export const calcDate = (created) => {
  const today = Date.now();
  let date = new Date(created).getTime();

  let unit = "";
  let time = today - date;
  const seconds = time / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const weeks = days / 7;
  if (seconds < 5) {
    time = "";
    unit = "just now";
  } else if (seconds < 60) {
    time = Math.floor(seconds);
    unit = "s ago";
  } else if (minutes < 60) {
    time = Math.floor(minutes);
    unit = "min ago";
  } else if (hours < 24) {
    time = Math.floor(hours);
    unit = "h ago";
  } else if (days < 7) {
    time = Math.floor(days);
    unit = "d ago";
  } else {
    time = Math.floor(weeks);
    unit = "w ago";
  }

  return { time, unit };
};
