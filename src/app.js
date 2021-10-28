import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import { parse } from './parser';
import { renderToggle, renderInputGroup, renderFeeds, renderMessage, renderPosts } from './view';

const setId = (posts, feedId) => posts.map((post) => ({ ...post, feedId }));

const app = () => {
  const state = {
    lng: 'ru',
    feeds: [],
    posts: [],
    messageType: '',
    status: '',
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'lng':
        renderToggle(value);
        break;
      case 'feeds':
        renderFeeds(value);
        break;
      case 'posts':
        renderPosts(value);
        break;
      case 'messageType':
        renderMessage(value);
        break;
      case 'status':
        renderInputGroup(value);
        break;
      default:
        break;
    }
  });

  const updateFeed = (feed) => {
    axios.get(`https://cors-anywhere.herokuapp.com/${feed.url}`)
      .then((response) => {
        const { parsedPosts } = parse(response);

        const newPosts = _.differenceBy(parsedPosts, watchedState.posts, 'postLink');

        if (newPosts.length > 0) {
          watchedState.posts.push(...setId(newPosts, feed.feedId));
          watchedState.status = 'updated';
        }
      })
      .catch(() => {
        watchedState.status = 'updatingFailed';
        watchedState.messageType = 'errorAuto';
      })
      .then(() => {
        setTimeout(updateFeed, 5000, feed);
      });
  };

  const submitButton = document.getElementById('submitButton');
  const input = document.getElementById('urlInput');
  const buttonEN = document.getElementById('en');
  const buttonRU = document.getElementById('ru');

  buttonEN.addEventListener('click', () => {
    i18next.changeLanguage('en');
    watchedState.lng = 'en';
    submitButton.value = i18next.t('button');
  });
  buttonRU.addEventListener('click', () => {
    i18next.changeLanguage('ru');
    watchedState.lng = 'ru';
    submitButton.value = i18next.t('button');
  });

  submitButton.addEventListener('click', () => {
    watchedState.status = 'loading';
    const userurl = input.value;

    const URLvalidation = yup.string()
      .required('empty')
      .url('invalidURL')
      .notOneOf(watchedState.feeds.map((feed) => feed.url), 'double');

    URLvalidation.validate(userurl)
      .then(() => {
        axios.get(`https://cors-anywhere.herokuapp.com/${userurl}`)
          .then((response) => {
            const { parsedFeed, parsedPosts } = parse(response);
            const feedId = _.uniqueId();

            const newFeed = { ...parsedFeed, url: userurl, feedId };

            watchedState.feeds.push(newFeed);
            watchedState.posts.push(...setId(parsedPosts, feedId).reverse());

            watchedState.messageType = 'success';
            watchedState.status = 'added';

            setTimeout(updateFeed, 5000, newFeed);
          })
          .catch((err) => {
            watchedState.status = 'loadingFailed';
            if (err.message === 'dom.querySelector(...) is null') {
              watchedState.messageType = 'invalidRSS';
            } else {
              watchedState.messageType = 'error';
            }
          });
      })
      .catch((err) => {
        watchedState.status = 'validationFailed';
        watchedState.messageType = err.message;
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
          invalidURL: 'Sorry, your url is invalid.',
          button: 'Add to your feed',
          error: 'Network Error',
          errorAuto: 'An unexpected error has occured while trying to autoupdate the feed. ',
          preview: 'Preview',
          readMore: 'Read more',
          closeModal: 'Close',
          empty: 'The field shoud not be empty',
          invalidRSS: 'URL doesn\'t have valid RSS',
        },
      },
      ru: {
        translation: {
          success: 'RSS успешно загружен',
          double: 'RSS уже существует',
          invalidURL: 'Ссылка должна быть валидным URL',
          button: 'Добавить в вашу ленту',
          error: 'Ошибка сети',
          errorAuto: 'Произошла ошибка при обновлении. ',
          preview: 'Просмотр',
          readMore: 'Читать полностью',
          closeModal: 'Закрыть',
          empty: 'Не должно быть пустым',
          invalidRSS: 'Ресурс не содержит валидный RSS',
        },
      },
    },
  })
    .then(() => app());
};
