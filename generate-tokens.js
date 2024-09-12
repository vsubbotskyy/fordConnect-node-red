module.exports = function (RED) {
  function FordConnectGenerateTokensNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.authCode = config.authCode;
    node.clientId = config.clientId;
    node.clientSecret = config.clientSecret;
    this.on("input", function (msg, send, done) {
      this.log(`FordConnect. Generate tokens. authCode: ${node.authCode}`);
      this.log("FordConnect. Generate tokens. clientId: " + node.clientId);
      this.log(
        "FordConnect. Generate tokens. clientSecret: " + node.clientSecret
      );
      // save clientId/Secret to context
      this.context().flow.set("fordConnectClientId", node.clientId);
      this.context().flow.set("fordConnectClientSecret", node.clientSecret);
      this.status({ fill: "blue", shape: "ring", text: "Generating tokens" });
      fetch(
        "https://dah2vb2cprod.b2clogin.com/914d88b1-3523-4bf6-9be4-1b96b4f6f919/oauth2/v2.0/token?p=B2C_1A_signup_signin_common",
        {
          method: "POST",
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: node.clientId,
            client_secret: node.clientSecret,
            code: node.authCode,
            //redirect_uri: "https%3A%2F%2Flocalhost%3A3000"
          }),
        }
      )
        .then((response) => {
          if (response.status !== 200) {
            this.status({
              fill: "red",
              shape: "ring",
              text: response.statusText,
            });
            this.log(
              "FordConnect. Generate tokens. fetch failed with status code: " +
                response.status
            );
            this.error(
              "FordConnect. Generate tokens. error: " + response.statusText
            );
            done(response.statusText);
          }
          this.log("FordConnect. Generate tokens. received response");
          return response.json();
        })
        .then((data) => {
          this.log(
            "FordConnect. Generate tokens. data: " + JSON.stringify(data)
          );
          const accessToken = data.access_token;
          const refreshToken = data.refresh_token;

          this.log("FordConnect. Generate tokens. accessToken: " + accessToken);
          this.log(
            "FordConnect. Generate tokens. refreshToken: " + refreshToken
          );
          if (this.err) {
            this.error("FordConnect. Generate tokens. error: " + this.err);
            done(err);
            return;
          }
          msg.payload = {
            ...msg.payload,
            accessToken: accessToken,
            refreshToken: refreshToken,
          };
          if (msg.payload.accessToken && msg.payload.refreshToken) {
            this.status({ fill: "green", shape: "dot", text: "Tokens ready" });
            send(msg);
          }
        })
        .catch((error) => {
          this.status({ fill: "red", shape: "ring", text: "Error" });
          this.error("FordConnect. Generate tokens. fetching error: " + error);
          done(error);
        });
    });
  }
  RED.nodes.registerType(
    "fordconnect-generate-tokens",
    FordConnectGenerateTokensNode
  );
};
