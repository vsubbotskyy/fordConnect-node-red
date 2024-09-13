function handleResponse(response, node, msg, send, done) {
  if (response.status < 200 || response.status >= 300) {
    node.status({
      fill: "red",
      shape: "ring",
      text: response.statusText,
    });
    node.log(`${msg} fetch failed with status code: ${response.status}`);
    switch (response.status) {
      case 401:
        node.error(`${msg} Unauthorized request`);
        node.status({
          fill: "red",
          shape: "ring",
          text: "Unauthorized",
        });
        send([
          null,
          {
            payload: "Unauthorized request. Please get the new access token",
          },
        ]);
        break;
      default:
        node.error(`${msg} error: ${response.statusText}`);
        node.status({
          fill: "red",
          shape: "ring",
          text: response.statusText,
        });
    }
    done(response.statusText);
    return false;
  }
  return true;
}

module.exports = handleResponse;
