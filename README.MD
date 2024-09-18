The FordConnect API allows developers to integrate FordConnect features into their applications. With the API, you can access vehicle data, control vehicle functions. This instructions will guide you through the process of using the FordConnect API in your node-red flows. Let's get started!

## Prerequisites

- Ford developer account. Generate clientId/clientSecret pair. More on: https://developer.ford.com/
- FordPass account. Be sure to complete your account setup before attempting to account link.

### Account Link

- Go to https://fordconnect.cv.ford.com/common/login/?make=F&application_id=AFDC085B-377A-4351-B23E-5E1D35FB3700&client_id=30990062-9618-40e1-a27b-7c6bcb23658a&response_type=code&state=123&redirect_uri=https%3A%2F%2Flocalhost%3A3000&scope=access
  Make sure that the Client ID in this URL matches the Client ID you received from developer.ford.com
- Using your account credentials, sign in to FordPass or Lincoln Way
- On the following screen, select the authorized vehicle in the vehicle list that you want to account link. This account linking process will enable you to retrieve vehicle data and execute remote vehicle commands.
- After you authorize the data sharing, you will be redirected to the _redirect_uri_ from the above url with the authorization code
- You will need the value after _code=_ for the _generate-tokens_ node

### Obtaining tokens

Generate tokens using auth code and clientId, clientSecret
![generate tokens flow](https://vsubbotskyy.github.io/fordConnect-node-red/images/generate-tokens.jpg)

### Using the API

After tokens are generated and saved to context you can start making requests to the API
![get vehicles list](https://vsubbotskyy.github.io/fordConnect-node-red/images/get-vehicles.jpg)

Access token is valid for 20 minutes, so if the request is failed with 401 status the token is probably expired. Error will be forwarded to the second output to which get new tokens node can be hooked up
![get vehicle details](https://vsubbotskyy.github.io/fordConnect-node-red/images/get-vehicle-details.jpg)

By default the car should send update on ignition status change. Sometimes vehicle info can be outdated, because server will return cached last values. To fetch the relevant data vehicle status request can be made. The request is non-blocking, so to delay output until refresh is completed "Wait for result check box" can be enabled in node config. There's also poll interval and max retry settings.
![refresh vehicle status](https://vsubbotskyy.github.io/fordConnect-node-red/images/refresh-vehicle-status.jpg)

> [!CAUTION]
> Ford advises to be mindful of how often the vehicle is polled, because it has impact on battery life.
