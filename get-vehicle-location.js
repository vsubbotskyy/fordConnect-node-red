const handleResponse = require("./utils/handleResponse");

module.exports = function (RED) {
  function FordConnectGetVehicleLocationNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.vehicleId = config.vehicleId;
    this.on("input", function (msg, send, done) {
      const accessToken = this.context().flow.get("fordConnectAccessToken");
      const vehicleId = node.vehicleId;
      this.log(
        `FordConnect. Get vehicle location. fetching data. accessToken: ${accessToken} vehicleId: ${vehicleId}`
      );
      this.status({
        fill: "blue",
        shape: "ring",
        text: "Getting vehicle location",
      });
      fetch(
        `https://api.mps.ford.com/api/fordconnect/v2/vehicles/${vehicleId}/location`,
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
              "FordConnect. Get vehicle location.",
              send,
              done
            )
          ) {
            return;
          }
          this.log("FordConnect. Get vehicle location. received response");
          this.trace(
            "FordConnect. Get vehicle location. response: " + response
          );
          if (response) {
            return response.json();
          } else {
            this.status({
              fill: "red",
              shape: "ring",
              text: "Empty response",
            });
            this.error("FordConnect. Get vehicle location. Empty response");
            done("Empty response");
            send([null, null, { payload: "Empty response" }]);
          }
        })
        .then((data) => {
          msg.payload = data;
          this.status({
            fill: "green",
            shape: "dot",
            text: "Vehicle location ready",
          });
          send([msg, null, null]);
          done();
        })
        .catch((error) => {
          this.status({ fill: "red", shape: "ring", text: "Error" });
          this.error(
            "FordConnect. Get vehicle location. fetching error: " + error
          );
          done(error);
        });
      if (this.err) {
        this.error("FordConnect. Get vehicle location. error: " + this.err);
        done(err);
        return;
      }
    });
  }
  RED.nodes.registerType(
    "fordconnect-get-vehicle-location",
    FordConnectGetVehicleLocationNode
  );
};
