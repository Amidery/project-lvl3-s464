import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import { renderInput, renderFeed, renderMessage } from './view';

const urlInput = document.getElementById('urlInput');
const urlSubmit = document.getElementById('urlSubmitButton');

const parse = (xml) => {
  const domparser = new DOMParser();
  const dom = domparser.parseFromString(xml.data, 'text/xml');

  const feedTitle = dom.querySelector('channel > title').textContent;
  const feedDescription = dom.querySelector('channel > description').textContent;
  const posts = [...dom.getElementsByTagName('item')].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postLink = post.querySelector('link').textContent;
    return { postTitle, postLink };
  });

  return { feedTitle, feedDescription, posts };
};

const app = () => {
  urlSubmit.value = i18next.t('button');

  const state = {
    userurl: '',
    isValid: 'valid',
    message: 'validated',
    processStatus: '',
    feedURLs: [],
    feedList: [],
  };

  const processStatuses = {
    validated: (watchedState) => {
      renderMessage(watchedState);
      urlSubmit.disabled = true;
    },
    added: (watchedState) => {
      renderMessage(watchedState);
      urlSubmit.disabled = false;
    },
    failed: (watchedState) => {
      renderMessage(watchedState);
      urlSubmit.disabled = false;
    },
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'isValid':
        renderInput(value);
        break;
      case 'processStatus':
        processStatuses[value](watchedState);
        break;
      case 'feedList':
        renderFeed(value);
        break;
      default:
        break;
    }
  });

  const isDouble = (userurl) => watchedState.feedURLs.includes(userurl);

  const isUrlValid = (userurl) => {
    const schema = yup.string().url();

    return schema
      .isValid(userurl)
      .then((valid) => valid);
  };

  urlSubmit.addEventListener('click', () => {
    watchedState.userurl = urlInput.value;

    isUrlValid(watchedState.userurl)
      .then((valid) => {
        if (!valid) {
          throw i18next.t('invalid');
        }
      })
      .then(() => {
        if (isDouble(watchedState.userurl)) {
          throw i18next.t('double');
        }
      })
      .then(() => {
        axios.get(`https://cors-anywhere.herokuapp.com/${watchedState.userurl}`)
          .then((feed) => {
            const parsedFeed = { ...parse(feed), url: watchedState.userurl };
            console.log(parsedFeed);
            watchedState.feedList.push(parsedFeed);

            watchedState.isValid = '';
            urlInput.value = '';
            watchedState.message = i18next.t('success');
            watchedState.processStatus = 'added';
            urlSubmit.disabled = false;
            watchedState.feedURLs.push(watchedState.userurl);
          });
      })
      .catch((errorMessage) => {
        watchedState.message = errorMessage;
        watchedState.isValid = 'invalid';
        watchedState.processStatus = 'failed';
      });
  });
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          success: 'URL was successfully added to your feed. Congrats!',
          double: 'This URL already exists in your feed',
          invalid: 'Sorry, your url is invalid.',
          button: 'Add to your feed',
        },
      },
      ru: {
        translation: {
          success: 'URL добавлен в вашу ленту новостей. Поздравляем!',
          double: 'Этот URL уже есть в вашей ленте новостей',
          invalid: 'Введен некорректный URL.',
          button: 'Добавить в вашу ленту',
        },
      },
    },
  })
    .then(() => app());

  urlSubmit.value = i18next.t('button');

  const buttonEN = document.getElementById('en');
  const buttonRU = document.getElementById('ru');

  buttonEN.addEventListener('click', () => i18next.changeLanguage('en'));
  buttonRU.addEventListener('click', () => i18next.changeLanguage('ru'));

  i18next.on('languageChanged', () => app());
};
