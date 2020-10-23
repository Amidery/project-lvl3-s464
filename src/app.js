import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import { renderToggle, renderInput, renderFeed, renderMessage } from './view';

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
    const postId = _.uniqueId();
    return { postTitle, postLink, postId };
  });

  const id = _.uniqueId();

  return { feedTitle, feedDescription, posts, id };
};

const app = () => {
  const state = {
    lng: 'en',
    userurl: '',
    isValid: 'valid',
    feed: [],
    message: '',
    status: '',
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'lng':
        renderToggle(value);
        break;
      case 'isValid':
        renderInput(value);
        break;
      case 'feed':
        renderFeed(value);
        break;
      case 'message':
        renderMessage(watchedState);
        break;
      case 'status':
        if (value === 'updated') {
          renderFeed(watchedState.feed);
        }
        break;
      default:
        break;
    }
  });

  const isDouble = (userurl) => watchedState.feed.map((channel) => channel.url).includes(userurl);

  const isUrlValid = (userurl) => {
    const schema = yup.string().url();

    return schema
      .isValid(userurl)
      .then((valid) => valid);
  };

  const updateChannel = (channel) => {
    const channelIndex = watchedState.feed.map((channelToUpdate, index) => (channelToUpdate.url === channel.url ? index : ''))
      .filter((v) => v !== '');

    axios.get(`https://cors-anywhere.herokuapp.com/${channel.url}`)
      .then((response) => {
        const updChannel = parse(response);
        const updPosts = updChannel.posts;
        const currPosts = channel.posts;
        const newPosts = _.differenceBy(updPosts, currPosts, 'postLink');
        if (newPosts.length > 0) {
          watchedState.feed[channelIndex].posts = [...currPosts, ...newPosts];
          watchedState.status = 'updated';
        }
      })
      .catch((error) => {
        watchedState.status = 'failed';

        if (error.response) {
          watchedState.message = `${i18next.t('errorResponseAuto')}${error.response.status}`;
        } else if (error.request) {
          watchedState.message = `${i18next.t('errorRequestAuto')}${error.request}`;
        } else {
          watchedState.message = `${i18next.t('errorAuto')}${error.message}`;
        }
      })
      .then(() => {
        watchedState.status = '';
        setTimeout(updateChannel, 5000, watchedState.feed[channelIndex]);
      });
  };

  const buttonEN = document.getElementById('en');
  const buttonRU = document.getElementById('ru');

  buttonEN.addEventListener('click', () => {
    i18next.changeLanguage('en');
    watchedState.lng = 'en';
    urlSubmit.value = i18next.t('button');
  });
  buttonRU.addEventListener('click', () => {
    i18next.changeLanguage('ru');
    watchedState.lng = 'ru';
    urlSubmit.value = i18next.t('button');
  });

  urlSubmit.addEventListener('click', () => {
    const userurl = urlInput.value;

    isUrlValid(userurl)
      .then((valid) => {
        urlSubmit.disabled = true;
        if (!valid) {
          throw i18next.t('invalid');
        }
      })
      .then(() => {
        if (isDouble(userurl)) {
          throw i18next.t('double');
        }
      })
      .then(() => {
        axios.get(`https://cors-anywhere.herokuapp.com/${userurl}`)
          .then((response) => {
            const parsedChannel = { ...parse(response), url: userurl };
            watchedState.feed.push(parsedChannel);

            urlInput.value = '';
            urlSubmit.disabled = false;
            watchedState.status = 'success';
            watchedState.message = i18next.t('success');

            setTimeout(updateChannel, 5000, parsedChannel);
          })
          .catch((error) => {
            urlSubmit.disabled = false;
            watchedState.status = 'failed';

            if (error.response) {
              watchedState.message = `${i18next.t('errorResponse')}${error.response.status}`;
            } else if (error.request) {
              watchedState.message = error.request;
            } else {
              watchedState.message = error.message;
            }
          });
      })
      .catch((error) => {
        urlSubmit.disabled = false;
        watchedState.status = 'failed';
        watchedState.isValid = 'invalid';
        watchedState.message = error;
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
          errorResponse: 'Error: ',
          errorResponseAuto: 'An unexpected error has occured while trying to autoupdate the feed. Error: ',
          errorRequestAuto: 'An unexpected error has occured while trying to autoupdate the feed. ',
          errorAuto: 'An unexpected error has occured while trying to autoupdate the feed. ',
        },
      },
      ru: {
        translation: {
          success: 'URL добавлен в вашу ленту новостей. Поздравляем!',
          double: 'Этот URL уже есть в вашей ленте новостей',
          invalid: 'Введен некорректный URL.',
          button: 'Добавить в вашу ленту',
          errorResponse: 'Ошибка: ',
          errorResponseAuto: 'Произошла ошибка при обновлении. Ошибка: ',
          errorRequestAuto: 'Произошла ошибка при обновлении. ',
          errorAuto: 'Произошла ошибка при обновлении. ',
        },
      },
    },
  })
    .then(() => app());
};
