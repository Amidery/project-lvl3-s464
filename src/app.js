import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import parse from './parser';
import {
  renderToggle,
  renderInputGroup,
  renderFeeds,
  renderMessage,
  renderPosts,
  renderModal,
} from './view';

const setId = (posts, feedId) => posts.map((post) => {
  const postId = _.uniqueId();
  return { ...post, postId, feedId };
});

const setPostStatus = (posts) => posts.map((post) => ({ ...post, status: 'new' }));

const getPostsReady = (posts, feedId) => {
  const postsWithId = setId(posts, feedId);
  const readyPosts = setPostStatus(postsWithId);
  return readyPosts;
};

const makeURL = (userurl) => {
  const proxy = 'https://hexlet-allorigins.herokuapp.com/get';
  const url = new URL(proxy);
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', userurl);

  return url;
};

const app = (i18n) => {
  const state = {
    lng: 'ru',
    feeds: [],
    posts: [],
    messageType: '',
    validationStatus: '',
    loadingStatus: '',
    modalPost: '',
  };

  const submitButton = document.getElementById('submitButton');
  const input = document.getElementById('urlInput');
  const form = document.getElementById('form');
  const feeds = document.getElementById('feeds');
  const buttonEN = document.getElementById('en');
  const buttonRU = document.getElementById('ru');

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'lng':
        renderToggle(value, buttonEN, buttonRU);
        break;
      case 'feeds':
        renderFeeds(value);
        break;
      case 'posts':
        renderPosts(value, i18n);
        break;
      case 'loadingStatus':
        renderInputGroup(value, submitButton, input);
        renderMessage(state, i18n);
        break;
      case 'validationStatus':
        renderInputGroup(value, submitButton, input);
        renderMessage(state, i18n);
        break;
      case 'modalPost':
        renderModal(value, i18n);
        break;
      default:
        break;
    }
  });

  const updateFeed = (feed) => {
    axios.get(makeURL(feed.url))
      .then((response) => {
        const { items } = parse(response.data);
        const newPosts = _.differenceBy(items, watchedState.posts, 'link');

        if (newPosts.length > 0) {
          const readyNewPosts = getPostsReady(newPosts, feed.feedId);
          watchedState.posts.push(...readyNewPosts.reverse());
          watchedState.loadingStatus = 'updated';
        }
      })
      .catch(() => {
        watchedState.messageType = 'errorAuto';
        watchedState.loadingStatus = 'updatingFailed';
      })
      .then(() => {
        setTimeout(updateFeed, 5000, feed);
      });
  };

  buttonEN.addEventListener('click', () => {
    i18n.changeLanguage('en');
    watchedState.lng = 'en';
    submitButton.value = i18n.t('button');
  });
  buttonRU.addEventListener('click', () => {
    i18n.changeLanguage('ru');
    watchedState.lng = 'ru';
    submitButton.value = i18n.t('button');
  });

  submitButton.addEventListener('click', (event) => {
    event.preventDefault();
    watchedState.messageType = '';
    watchedState.validationStatus = null;
    watchedState.loadingStatus = 'loading';

    const formData = new FormData(form);
    const userurl = formData.get('url');

    const URLvalidation = yup.string()
      .required('empty')
      .url('invalidURL')
      .notOneOf(watchedState.feeds.map((feed) => feed.url), 'double');

    URLvalidation.validate(userurl)
      .then(() => {
        watchedState.validationStatus = 'validationOK';

        axios.get(makeURL(userurl))
          .then((response) => {
            const { parsedFeed, items } = parse(response.data);
            const feedId = _.uniqueId();
            const newFeed = { ...parsedFeed, url: userurl, feedId };
            const newPosts = getPostsReady(items, feedId);

            watchedState.feeds.push(newFeed);
            watchedState.posts.push(...newPosts.reverse());
            watchedState.messageType = 'success';
            watchedState.loadingStatus = 'loaded';

            setTimeout(updateFeed, 5000, newFeed);
          })
          .catch((err) => {
            if (err.response || err.request) {
              watchedState.messageType = 'error';
            } else {
              watchedState.messageType = 'invalidRSS';
            }
            watchedState.loadingStatus = 'loadingFailed';
          });
      })
      .catch((err) => {
        watchedState.messageType = err.message;
        watchedState.validationStatus = 'validationFailed';
      });
  });

  feeds.addEventListener('click', (e) => {
    if (e.target.type === 'button') {
      const postId = e.target.previousSibling.getAttribute('id');
      const postToPreview = state.posts.filter((post) => post.postId === postId)[0];
      watchedState.modalPost = postToPreview;
      watchedState.posts = watchedState.posts.map((post) => {
        if (post.postId === postId) {
          return { ...post, status: 'previewed' };
        }
        return post;
      });
    }
  });
};

export default () => {
  const i18nextInstance = i18next.createInstance();

  return i18nextInstance.init({
    lng: 'ru',
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
    .then(() => app(i18nextInstance));
};
