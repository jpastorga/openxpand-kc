export const scopeOptions = [
    'dpv:FraudPreventionAndDetection#device-status',
    'dpv:FraudPreventionAndDetection#location-verification',
    'dpv:FraudPreventionAndDetection#location-retrieval',
    'dpv:FraudPreventionAndDetection#number-verification',
    'dpv:FraudPreventionAndDetection#sim-swap'
];

export const environments = {
    sandbox: {
      auth: 'https://opengw.dev.openxpand.com',
      api: 'https://api.dev.openxpand.com/api/camara/sandbox',
    },
    development: {
      auth: 'https://opengw.dev.openxpand.com',
      api: 'https://api.dev.openxpand.com/api/camara',
    },
    testing: {
      auth: 'https://opengw.test.openxpand.com',
      api: 'https://api.test.openxpand.com/api/camara',
    },
    production: {
      auth: 'https://opengw.openxpand.com',
      api: 'https://api.openxpand.com/api/camara',
    },
  };


export const apiList = [
    {
      name: 'numberVerification',
      title: 'Number Verification',
      path: 'number-verification/v0/verify',
      body: '{"phoneNumber": "541141832256"}',
      displayName: 'Verify',
      description: 'Verify a phone number.',
      usecase: 'numberVerification',
      scope: 'dpv:FraudPreventionAndDetection#number-verification',
    },
    {
      name: 'retrievePhoneNumber',
      title: 'Number Verification',
      path: 'number-verification/v0/device-phone-number',
      body: '',
      method: 'GET',
      displayName: 'Device Phone Number',
      description: 'Retrieve a phone number from a device.',
      usecase: 'numberVerification',
      scope: 'dpv:FraudPreventionAndDetection#number-verification',
    },
    {
      name: 'deviceStatus',
      title: 'Device Status',
      path: 'device-status/v0/connectivity',
      body: '{"device": {"phoneNumber": "541141832256"}}',
      displayName: 'Connectivity',
      description: 'Obtains the connectivity status of a device.',
      usecase: 'deviceStatus',
      scope: 'dpv:FraudPreventionAndDetection#device-status',
    },
    {
      name: 'deviceStatusRoaming',
      title: 'Device Status',
      path: 'device-status/v0/roaming',
      body: '{"device": {"phoneNumber": "541141832256"}}',
      displayName: 'Roaming',
      description: 'Checks if the device is currently in roaming mode.',
      usecase: 'deviceStatus',
      scope: 'dpv:FraudPreventionAndDetection#device-status',
    },
    {
      name: 'deviceLocationRetrieve',
      title: 'Device Location',
      path: 'location-retrieval/v0/retrieve',
      body: '{"device": {"phoneNumber": "541141832256"},"maxAge": 60}',
      displayName: 'Retrieve',
      description: 'Retrieves the location of a device.',
      usecase: 'deviceLocation',
      scope: 'dpv:FraudPreventionAndDetection#location-retrieval',
    },
    {
      name: 'deviceLocationVerify',
      title: 'Device Location',
      path: 'location-verification/v0/verify',
      body: '{"device": {"phoneNumber": "541141832256"},"area": {"areaType": "CIRCLE","center": {"latitude": 50.60,"longitude": 50.735851},"radius": 50000}}',
      displayName: 'Verify',
      description: 'Verifies the location of a device.',
      usecase: 'deviceLocation',
      scope: 'dpv:FraudPreventionAndDetection#location-verification',
    },
    {
      name: 'simSwap',
      title: 'SIM Swap',
      path: 'sim-swap/v0/retrieve-date',
      body: '{"phoneNumber": "543462641443"}',
      displayName: 'Retrieve Date',
      description: 'Retrieve SIM swap date',
      usecase: 'simSwap',
      scope: 'dpv:FraudPreventionAndDetection#sim-swap',
    },
    {
      name: "simSwapCheck",
      title: 'SIM Swap',
      path: "sim-swap/v0/check",
      body: '{"phoneNumber": "543462641443"}',
      displayName: "Check",
      description: "Checks if SIM swap has been performed during a past period of time.",
      usecase: 'simSwap',
      scope: 'dpv:FraudPreventionAndDetection#sim-swap',
    }
  ];

export const steps = [
    {
      title: "Step 1:",
      description: "Authorization code request (GET: user-side)",
      url: `:host/auth/realms/:tenant/protocol/openid-connect/auth?response_type=code&client_id=:clientId&redirect_uri=https://openxpand-kc.vercel.app/api/callback&scope=:scope&prompt=none`,
      method: "GET"
    },
    {
      title: "Step 2:",
      description: "Token request with authorization code (POST: client-side)",
      url: `:host/auth/realms/:tenant/protocol/openid-connect/token`,
      method: "POST",
      headers: 'Content-Type: application/x-www-form-urlencoded',
      body: `grant_type=authorization_code&code=:code&redirect_uri=https://openxpand-kc.vercel.app/api/callback&client_id=:clientId&client_secret=:clientSecret`,
    },
];