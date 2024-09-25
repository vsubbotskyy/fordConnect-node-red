const handleResponse = require("./utils/handleResponse");
const pollCommandStatus = require("./utils/pollCommandStatus");

module.exports = function (RED) {
  function FordConnectRefreshVehicleLocationNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.vehicleId = config.vehicleId;
    this.on("input", function (msg, send, done) {
      const accessToken = this.context().flow.get("fordConnectAccessToken");
      const vehicleId = node.vehicleId;
      this.log(
        `FordConnect. Refresh vehicle location. fetching data. accessToken: ${accessToken} vehicleId: ${vehicleId}`
      );
      this.status({
        fill: "blue",
        shape: "ring",
        text: "Refreshing vehicle location",
      });
      fetch(
        `https://api.mps.ford.com/api/fordconnect/v1/vehicles/${vehicleId}/location`,
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
              "FordConnect. Refresh vehicle location.",
              send,
              done
            )
          ) {
            return;
          }
          this.log("FordConnect. Refresh vehicle location. received response");
          return response.json();
        })
        .then((data) => {
          const locationCommandId = data.commandId;
          this.status({
            fill: "yellow",
            shape: "ring",
            text: "Waiting for vehicle status",
          });
          pollCommandStatus(
            `https://api.mps.ford.com/api/fordconnect/v1/vehicles/${vehicleId}/location/${locationCommandId}`,
            accessToken,
            node,
            msg,
            {
              send,
              done,
            },
            "FordConnect. Refresh vehicle location."
          );
        })
        .catch((error) => {
          this.status({ fill: "red", shape: "ring", text: "Error" });
          this.error(
            "FordConnect. Refresh vehicle location. fetching error: " + error
          );
          done(error);
        });
      if (this.err) {
        this.error("FordConnect. Refresh vehicle location. error: " + this.err);
        done(err);
        return;
      }
    });
  }
  RED.nodes.registerType(
    "fordconnect-refresh-vehicle-location",
    FordConnectRefreshVehicleLocationNode
  );
};
