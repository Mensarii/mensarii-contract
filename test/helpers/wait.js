// Returns the time of the last mined block in seconds
async function wait(milliseconds) {
  var timeStart = Date.now();
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      var timeLeft = Date.now() - (timeStart + milliseconds);
      if (timeLeft <= 0) {
        resolve();
      } else {
        setTimeout(() => {
          resolve();
        }, timeLeft);
      }
    }, milliseconds - (timeStart - Date.now()));
  });
}


const duration = {
  milliseconds: function (val) { return val; },
  seconds: function (val) { return val * this.milliseconds(1000); },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};

module.exports = wait;
module.exports.seconds = async function (seconds) {
  return await wait(duration.seconds(seconds));
}

module.exports.minutes = async function (minutes) {
  return await wait(duration.minutes(minutes));
}

module.exports.hours = async function (hours) {
  return await wait(duration.hours(hours));
}

// The likelihood of using hours is slim, the rest are ridiculous.