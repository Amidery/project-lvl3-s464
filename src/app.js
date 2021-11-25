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

const setPostsStatus = (posts) => posts.map((post) => ({ postId: post.postId, status: 'new' }));

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
    postsStatus: [],
    messageType: null,
    validationStatus: 'initial',
    loadingStatus: 'initial',
    modalPost: null,
  };

  const submitButton = document.getElementById('submitButton');
  const input = document.getElementById('urlInput');
  const form = document.getElementById('form');
  const feedsContainer = document.getElementById('feeds');
  const message = document.getElementById('message');
  const buttonEN = document.getElementById('en');
  const buttonRU = document.getElementById('ru');
  const modal = document.getElementById('modal');

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'lng':
        renderToggle(value, buttonEN, buttonRU, submitButton, i18n);
        break;
      case 'feeds':
        renderFeeds(value, feedsContainer);
        break;
      case 'postsStatus':
        renderPosts(value, state.posts, i18n);
        break;
      case 'loadingStatus':
        switch (value) {
          case 'initial':
            renderInputGroup(submitButton, input, true);
            renderMessage(state, message, i18n);
            break;
          case 'loading':
            renderInputGroup(submitButton, input);
            renderMessage(state, message, i18n, false);
            break;
          case 'loaded':
            renderInputGroup(submitButton, input, true);
            renderMessage(state, message, i18n, true);
            break;
          case 'loadingFailed':
            renderInputGroup(submitButton, input, false);
            renderMessage(state, message, i18n, false);
            break;
          case 'updated':
            renderInputGroup(submitButton, input, true);
            renderMessage(state, message, i18n, true);
            break;
          case 'updatingFailed':
            renderInputGroup(submitButton, input, false);
            renderMessage(state, message, i18n, false);
            break;
          default:
            break;
        }
        break;
      case 'validationStatus':
        switch (value) {
          case 'initial':
            renderMessage(state, message, i18n);
            break;
          case 'validationFailed':
            renderInputGroup(submitButton, input, false);
            renderMessage(state, message, i18n, false);
            break;
          case 'validationOK':
            renderInputGroup(submitButton, input);
            break;
          default:
            break;
        }
        break;
      case 'modalPost':
        renderModal(value, modal, i18n);
        break;
      default:
        break;
    }
  });

  const updateFeed = (feed) => {
    axios.get(makeURL(feed.url))
      .then((response) => {
        const { items } = parse(response.data);
        const newItems = _.differenceBy(items, watchedState.posts, 'link');

        if (newItems.length > 0) {
          const newPosts = setId(newItems, feed.feedId);
          watchedState.posts.push(...newPosts.reverse());
          watchedState.postsStatus.push(...setPostsStatus(newPosts));
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
  });
  buttonRU.addEventListener('click', () => {
    i18n.changeLanguage('ru');
    watchedState.lng = 'ru';
  });

  submitButton.addEventListener('click', (event) => {
    event.preventDefault();
    watchedState.messageType = null;
    watchedState.validationStatus = 'initial';
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

        return axios.get(makeURL(userurl));
      })
      .then((response) => {
        const { parsedFeed, items } = parse(response.data);
        const feedId = _.uniqueId();
        const newFeed = { ...parsedFeed, url: userurl, feedId };
        const newPosts = setId(items, feedId);
        watchedState.feeds.push(newFeed);
        watchedState.posts.push(...newPosts.reverse());
        watchedState.postsStatus.push(...setPostsStatus(newPosts));

        watchedState.messageType = 'success';
        watchedState.loadingStatus = 'loaded';

        setTimeout(updateFeed, 5000, newFeed);
      })
      .catch((err) => {
        if (err.isAxiosError) {
          watchedState.messageType = 'error';
          watchedState.loadingStatus = 'loadingFailed';
        } else if (err.isParseError) {
          watchedState.messageType = 'invalidRSS';
          watchedState.loadingStatus = 'loadingFailed';
        } else if (err.message) {
          watchedState.messageType = err.message;
          watchedState.validationStatus = 'validationFailed';
        }
      });
  });

  feedsContainer.addEventListener('click', (e) => {
    if (e.target.type === 'button') {
      const postId = e.target.previousSibling.getAttribute('id');
      const postToPreview = state.posts.find((post) => post.postId === postId);
      watchedState.modalPost = postToPreview;
      watchedState.postsStatus = watchedState.postsStatus.map((post) => {
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
