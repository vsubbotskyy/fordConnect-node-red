module.exports = function (RED) {
  function FordConnectGetTokensNode(config) {
    RED.nodes.createNode(this, config);
    this.on("input", function (msg, send, done) {
      const clientId = this.context().flow.get("fordConnectClientId");
      const clientSecret = this.context().flow.get("fordConnectClientSecret");
      const refreshToken = this.context().flow.get("fordConnectRefreshToken");
      this.trace(
        `FordConnect. Get tokens. Client ID: ${clientId}, Client Secret: ${clientSecret}, Refresh Token: ${refreshToken}`
      );
      fetch(
        "https://dah2vb2cprod.b2clogin.com/914d88b1-3523-4bf6-9be4-1b96b4f6f919/oauth2/v2.0/token?p=B2C_1A_signup_signin_common",
        {
          method: "POST",
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
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
              "FordConnect. Get tokens. fetch failed with status code: " +
                response.status
            );
            switch (response.status) {
              case 401:
                this.error("FordConnect. Get tokens. unauthorized request");
                break;
              case 403:
                this.error("FordConnect. Get tokens. forbidden request");
                break;
              case 404:
                this.error("FordConnect. Get tokens. not found");
                break;
              default:
                this.error(
                  "FordConnect. Get tokens. error: " + response.statusText
                );
            }
            done(response.statusText);
          }
          this.log("FordConnect. Get tokens. received response");
          return response.json();
        })
        .then((data) => {
          this.trace("FordConnect. Get tokens. data: " + JSON.stringify(data));
          const accessToken = data.access_token;
          const refreshToken = data.refresh_token;

          this.trace("FordConnect. Get tokens. accessToken: " + accessToken);
          this.trace("FordConnect. Get tokens. refreshToken: " + refreshToken);
          if (this.err) {
            this.error("FordConnect. Get tokens. error: " + this.err);
            done(err);
            return;
          }

          // warn if refresh token is expiring in less than 2 days
          if (
            data.refresh_token_expires_in &&
            data.refresh_token_expires_in < 60 * 60 * 24 * 2
          ) {
            this.status({
              fill: "yellow",
              shape: "ring",
              text: "Refresh token is about to expire",
            });
          } else {
            this.status({
              fill: "green",
              shape: "dot",
              text: "Tokens refreshed",
            });
          }
          msg.payload = {
            accessToken: accessToken,
            refreshToken: refreshToken,
            refreshTokenExpiresIn: data.refresh_token_expires_in,
          };
          if (msg.payload.accessToken && msg.payload.refreshToken) {
            send(msg);
          }
        })
        .catch((error) => {
          this.error("FordConnect. Get tokens. fetching error: " + error);
          done(error);
        });
    });
  }
  RED.nodes.registerType("fordconnect-get-tokens", FordConnectGetTokensNode);
};
