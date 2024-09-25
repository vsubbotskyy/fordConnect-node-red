const handleResponse = require("./utils/handleResponse");

module.exports = function (RED) {
  function FordConnectGetVehicleInfoNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.vehicleId = config.vehicleId;
    this.on("input", function (msg, send, done) {
      const accessToken = this.context().flow.get("fordConnectAccessToken");
      const vehicleId = node.vehicleId;
      this.log(
        `FordConnect. Get vehicle info. fetching data. accessToken: ${accessToken} vehicleId: ${vehicleId}`
      );
      this.status({
        fill: "blue",
        shape: "ring",
        text: "Getting vehicle info",
      });
      fetch(
        `https://api.mps.ford.com/api/fordconnect/v3/vehicles/${vehicleId}`,
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
              "FordConnect. Get vehicle info.",
              send,
              done
            )
          ) {
            return;
          }
          this.log("FordConnect. Get vehicle info. received response");
          this.trace("FordConnect. Get vehicle info. response: " + response);
          if (response) {
            return response.json();
          } else {
            this.status({
              fill: "red",
              shape: "ring",
              text: "Empty response",
            });
            this.error("FordConnect. Get vehicle info. Empty response");
            done("Empty response");
            send([null, null, { payload: "Empty response" }]);
          }
        })
        .then((data) => {
          msg.payload = data;
          this.status({
            fill: "green",
            shape: "dot",
            text: "Vehicle info ready",
          });
          send([msg, null, null]);
          done();
        })
        .catch((error) => {
          this.status({ fill: "red", shape: "ring", text: "Error" });
          this.error("FordConnect. Get vehicle info. fetching error: " + error);
          done(error);
        });
      if (this.err) {
        this.error("FordConnect. Get vehicle info. error: " + this.err);
        done(err);
        return;
      }
    });
  }
  RED.nodes.registerType(
    "fordconnect-get-vehicle-info",
    FordConnectGetVehicleInfoNode
  );
};
