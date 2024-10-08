const handleResponse = require("./handleResponse");

// nodeRedProps: send, done
function pollCommandStatus(
  url,
  accessToken,
  node,
  msg,
  nodeRedProps,
  logString = "FordConnect.",
  pollInterval = 8,
  maxRetries = 3
) {
  let pollCounter = 0;
  const interval = setInterval(() => {
    node.log(`${logString} Polling. Counter: ${pollCounter}`);
    fetch(url, {
      method: "GET",
      headers: {
        "Application-Id": "AFDC085B-377A-4351-B23E-5E1D35FB3700",
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((response) => {
        if (
          !handleResponse(
            response,
            node,
            `${logString} Polling.`,
            nodeRedProps.send,
            nodeRedProps.done
          )
        ) {
          return;
        }
        node.log(`${logString} polling received response`);
        return response.json();
      })
      .then((data) => {
        if (data.commandStatus === "COMPLETED") {
          node.log(`${logString} polling completed`);
          msg.payload = data;
          node.status({
            fill: "green",
            shape: "dot",
            text: "Command completed",
          });
          nodeRedProps.send([msg, null]);
          nodeRedProps.done();
          clearInterval(interval);
          return;
        } else if (data.commandStatus === "FAILED") {
          node.log(`${logString} polling failed`);
          node.status({
            fill: "red",
            shape: "ring",
            text: "Command failed",
          });
          nodeRedProps.send([null, { payload: data }]);
          nodeRedProps.done();
          clearInterval(interval);
          return;
        } else {
          node.log(`${logString} polling status: ${data.commandStatus}`);
          node.status({
            fill: "yellow",
            shape: "ring",
            text: `Polling. Status: ${data.commandStatus}`,
          });
        }
      })
      .catch((error) => {
        node.status({ fill: "red", shape: "ring", text: "Error" });
        node.error(`${logString} polling fetching error: ${error}`);
        nodeRedProps.done(error);
        clearInterval(interval);
      });

    pollCounter++;
    if (pollCounter >= maxRetries) {
      node.status({
        fill: "red",
        shape: "ring",
        text: "Max retries reached",
      });
      node.error(`${logString} Max retries reached`);
      nodeRedProps.done(new Error("Max retries reached"));
      clearInterval(interval);
    }
  }, pollInterval * 1000);
}

module.exports = pollCommandStatus;
