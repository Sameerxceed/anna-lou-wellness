const config = {
  locales: ['en'],
  // Disable Strapi tutorials and promotions
  tutorials: false,
  notifications: { releases: false },
  // Customize login page
  auth: {
    logo: null,
  },
  theme: {
    light: {
      colors: {
        // Anna Lou Wellness brand — Red accent
        primary100: '#FFDCDE',
        primary200: '#F280AA',
        primary500: '#EE312F',
        primary600: '#CC2A28',
        primary700: '#231F20',
        // Buttons
        buttonPrimary500: '#EE312F',
        buttonPrimary600: '#CC2A28',
        // Neutral tones — warm cream foundation
        neutral0: '#FFFFFF',
        neutral100: '#F5F3EF',
      },
    },
  },
  // White-label: replace all Strapi references
  translations: {
    en: {
      'app.components.LeftMenu.navbrand.title': 'Anna Lou Wellness',
      'app.components.LeftMenu.navbrand.workplace': 'CMS',
      'app.components.HomePage.welcome': 'Welcome to Anna Lou Wellness CMS',
      'app.components.HomePage.welcome.again': 'Welcome back',
      'app.components.HomePage.welcomeBlock.content':
        'Manage your website content — pages, products, coaching, workshops, blog, and more.',
      'app.components.HomePage.welcomeBlock.content.again':
        'Manage your website content — pages, products, coaching, workshops, blog, and more.',
      'Settings.application.strpiVersion': 'Version',
      'global.plugins.sentry.title': '',
      // Login page
      'Auth.form.welcome.title': 'Anna Lou Wellness',
      'Auth.form.welcome.subtitle': 'Log in to manage your website',
    },
  },
};

const bootstrap = (app) => {
  // Remove "How likely to recommend Strapi" NPS survey
  // Hide Strapi logo from document title
  document.title = 'Anna Lou Wellness CMS';
};

export default {
  config,
  bootstrap,
};
