module.exports = function (RED) {
  function FordConnectSaveTokensNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.on("input", function (msg, send, done) {
      this.log(
        "FordConnect. Save tokens. input: " + JSON.stringify(msg.payload)
      );
      this.status({});
      const accessToken = msg.payload.accessToken || node.accessToken;
      const refreshToken = msg.payload.refreshToken || node.refreshToken;
      this.log("FordConnect. Save tokens. accessToken: " + accessToken);
      this.log("FordConnect. Save tokens. refreshToken: " + refreshToken);
      // save tokens to context
      this.context().flow.set("fordConnectAccessToken", accessToken);
      this.context().flow.set("fordConnectRefreshToken", refreshToken);
      if (this.err) {
        this.error("FordConnect. Save tokens. error: " + this.err);
        done(err);
        return;
      }
      msg.payload = {
        ...msg.payload,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      if (msg.payload.accessToken && msg.payload.refreshToken) {
        this.status({ fill: "green", shape: "dot", text: "Tokens saved" });
        send(msg);
      }
    });
  }
  RED.nodes.registerType("fordconnect-save-tokens", FordConnectSaveTokensNode);
};
