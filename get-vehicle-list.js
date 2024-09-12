module.exports = function (RED) {
  function FordConnectGetVehicleListNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.on("input", function (msg, send, done) {
      const accessToken = this.context().flow.get("fordConnectAccessToken");
      this.log(
        `FordConnect. Get vehicle list. fetching data. accessToken: ${accessToken}`
      );
      fetch("https://api.mps.ford.com/api/fordconnect/v2/vehicles", {
        method: "GET",
        headers: {
          "Application-Id": "AFDC085B-377A-4351-B23E-5E1D35FB3700",
          Authorization: "Bearer " + accessToken,
        },
      })
        .then((response) => {
          if (response.status !== "SUCCESS") {
            this.status({
              fill: "red",
              shape: "ring",
              text: response.statusText,
            });
            this.log(
              "FordConnect. Get vehicle list. fetch failed with status code: " +
                response.status
            );
            switch (response.status) {
              case 401:
                this.error(
                  "FordConnect. Get vehicle list. unauthorized request"
                );
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
                  "FordConnect. Get vehicle list. error: " + response.statusText
                );
            }
            done(response.statusText);
          }
          this.log("FordConnect. Get vehicle list. received response");
          return response.json();
        })
        .then((data) => {
          msg.payload = data;
          this.status({});
          send([msg, null]);
          done();
        })
        .catch((error) => {
          this.error("FordConnect. Get vehicle list. fetching error: " + error);
          done(error);
        });
      if (this.err) {
        this.error("FordConnect. Get vehicle list. error: " + this.err);
        done(err);
        return;
      }
    });
  }
  RED.nodes.registerType(
    "fordconnect-get-vehicle-list",
    FordConnectGetVehicleListNode
  );
};
