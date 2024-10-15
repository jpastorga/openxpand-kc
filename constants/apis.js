
const apiList = [
    {
      name: 'numberVerification',
      path: '/number-verification/v0/verify',
      body: '{"phoneNumber": "541141832256"}',
      displayName: 'Number Verification',
      description: 'Verifica un número de telefono.',
    },
    {
      name: 'retrievePhoneNumber',
      path: '/number-verification/v0/device-phone-number',
      body: '',
      method: 'GET',
      displayName: 'Retrieve Phone Number',
      description: 'Recupera el número de telefono.',
    },
    {
      name: 'deviceStatus',
      path: '/device-status/v0/connectivity',
      body: '{"device": {"phoneNumber": "541141832256"}}',
      displayName: 'Device Status - Connectivity',
      description: 'Obtiene el estado actual de un dispositivo.',
    },
    {
      name: 'deviceStatusRoaming',
      path: '/device-status/v0/roaming',
      body: '{"device": {"phoneNumber": "541141832256"}}',
      displayName: 'Device Status - Roaming',
      description: 'Obtiene el estado actual de un dispositivo.',
    },
    {
      name: 'deviceLocationRetrieve',
      path: '/location-retrieval/v0/retrieve',
      body: '{"device": {"phoneNumber": "541141832256"},"maxAge": 60}',
      displayName: 'Device Location - Retrieve',
      description: 'Recupera la ubicación actual de un dispositivo.',
    },
    {
      name: 'deviceLocationVerify',
      path: '/location-verification/v0/verify',
      body: '{"device": {"phoneNumber": "541141832256"},"area": {"areaType": "CIRCLE","center": {"latitude": 50.60,"longitude": 50.735851},"radius": 50000}}',
      displayName: 'Device Location - Verify',
      description: 'Valida la ubicación actual de un dispositivo.',
    }
  ];

export default apiList;