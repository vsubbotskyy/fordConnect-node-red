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
          if (response.status !== "SUCCESS") {
            this.status({
              fill: "red",
              shape: "ring",
              text: response.statusText,
            });
            this.log(
              "FordConnect. Get vehicle info. fetch failed with status code: " +
                response.status
            );
            switch (response.status) {
              case 401:
                this.error(
                  "FordConnect. Get vehicle info. Unauthorized request"
                );
                this.status({
                  fill: "red",
                  shape: "ring",
                  text: "Unauthorized",
                });
                send([
                  null,
                  {
                    payload:
                      "Unauthorized request. Please get the new access token",
                  },
                ]);
                break;
              default:
                this.error(
                  "FordConnect. Get vehicle info. error: " + response.statusText
                );
                this.status({
                  fill: "red",
                  shape: "ring",
                  text: response.statusText,
                });
            }
            done(response.statusText);
          }
          this.log("FordConnect. Get vehicle info. received response");
          return response.json();
        })
        .then((data) => {
          msg.payload = data;
          this.status({
            fill: "green",
            shape: "dot",
            text: "Vehicle info ready",
          });
          send([msg, null]);
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
