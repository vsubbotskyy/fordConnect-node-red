const handleResponse = require("./utils/handleResponse");

module.exports = function (RED) {
  function FordConnectRefreshVehicleStatusNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.vehicleId = config.vehicleId;
    node.pollStatus = config.pollStatus;
    node.pollInterval = config.pollInterval;
    node.maxRetries = config.maxRetries;
    this.on("input", function (msg, send, done) {
      const accessToken = this.context().flow.get("fordConnectAccessToken");
      const vehicleId = node.vehicleId;
      this.log(`FordConnect. Refresh vehicle status. vehicleId: ${vehicleId}`);
      this.status({
        fill: "blue",
        shape: "ring",
        text: "Refreshing vehicle status",
      });
      fetch(
        `https://api.mps.ford.com/api/fordconnect/v1/vehicles/${vehicleId}/status`,
        {
          method: "POST",
          headers: {
            "Application-Id": "AFDC085B-377A-4351-B23E-5E1D35FB3700",
            Authorization: "Bearer " + accessToken,
          },
        }
      )
        .then((response) => {
          if (
            !handleResponse(
              response,
              node,
              "FordConnect. Refresh vehicle status.",
              send,
              done
            )
          ) {
            return;
          }
          this.log("FordConnect. Refresh vehicle status. received response");
          return response.json();
        })
        .then((data) => {
          if (node.pollStatus) {
            const statusCommandId = data.commandId;
            this.log("FordConnect. Refresh vehicle status. polling enabled");
            this.status({
              fill: "yellow",
              shape: "ring",
              text: "Waiting for vehicle status",
            });
            let pollCounter = 0;
            const possStatusInterval = setInterval(() => {
              fetch(
                `https://api.mps.ford.com/api/fordconnect/v1/vehicles/${vehicleId}/statusrefresh/${statusCommandId}`,
                {
                  method: "GET",
                  headers: {
                    "Application-Id": "AFDC085B-377A-4351-B23E-5E1D35FB3700",
                    Authorization: "Bearer " + accessToken,
                  },
                }
              )
                .then((response) => {
                  if (
                    !handleResponse(
                      response,
                      node,
                      "FordConnect. Refresh vehicle status. Polling.",
                      send,
                      done
                    )
                  ) {
                    return;
                  }
                  this.log(
                    "FordConnect. Refresh vehicle status. polling received response"
                  );
                  return response.json();
                })
                .then((data) => {
                  msg.payload = data;
                  this.status({
                    fill: "green",
                    shape: "dot",
                    text: "Vehicle status updated",
                  });
                  send([msg, null]);
                  done();
                  clearInterval(possStatusInterval);
                })
                .catch((error) => {
                  this.status({ fill: "red", shape: "ring", text: "Error" });
                  this.error(
                    "FordConnect. Refresh vehicle status. polling fetching error: " +
                      error
                  );
                  done(error);
                  clearInterval(possStatusInterval);
                });

              pollCounter++;
              if (pollCounter >= node.maxRetries) {
                this.status({
                  fill: "red",
                  shape: "ring",
                  text: "Max retries reached",
                });
                this.error(
                  "FordConnect. Refresh vehicle status. Max retries reached"
                );
                done(new Error("Max retries reached"));
                clearInterval(possStatusInterval);
              }
            }, node.pollInterval * 1000);
          } else {
            msg.payload = data;
            this.status({
              fill: "green",
              shape: "dot",
              text: "Vehicle status updated",
            });
            send([msg, null]);
            done();
          }
        })
        .catch((error) => {
          this.status({ fill: "red", shape: "ring", text: "Error" });
          this.error(
            "FordConnect. Refresh vehicle status. fetching error: " + error
          );
          done(error);
        });
      if (this.err) {
        this.error("FordConnect. Refresh vehicle status. error: " + this.err);
        done(err);
        return;
      }
    });
  }
  RED.nodes.registerType(
    "fordconnect-refresh-vehicle-status",
    FordConnectRefreshVehicleStatusNode
  );
};
