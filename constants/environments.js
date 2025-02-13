const environments = {
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
  
  export default environments;