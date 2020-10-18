import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import { renderInput, renderFeed, renderMessage } from './view';

export default () => {
  const urlInput = document.getElementById('urlInput');
  const urlSubmit = document.getElementById('urlSubmitButton');
  let userurl;

  const state = {
    urlValidation: {
      isValid: '',
    },
    message: '',
    processStatus: '',
    feedList: [],
    posts: [],
  };

  const processStatusActions = {
    validated: (watchedState) => {
      parser();
      renderMessage(watchedState);
    },
    added: (watchedState) => {
      renderMessage(watchedState);
    },
    failed: (watchedState) => {
      renderMessage(watchedState);
    },
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'urlValidation.isValid':
        renderInput(value);
        break;
      case 'processStatus':
        processStatusActions[value](watchedState);
        break;
      case 'feedList':
        renderFeed(value, state.posts);
        break;
      default:
        break;
    }
  });

  const isDouble = (url) => {
    const arr = watchedState.feedList.filter((obj) => obj.userurl === url);
    return arr.length !== 0;
  };

  const validateURL = () => {
    userurl = urlInput.value;

    const schema = yup.string().url();

    schema
      .isValid(userurl)
      .then((valid) => {
        if (!valid) {
          watchedState.urlValidation.isValid = 'invalid';
          watchedState.message = 'Sorry, your url is invalid. Please double check.';
          watchedState.processStatus = 'failed';
          return;
        }

        if (isDouble(userurl)) {
          watchedState.urlValidation.isValid = 'invalid';
          watchedState.message = 'URL already exists ';
          watchedState.processStatus = 'failed';
        } else {
          watchedState.urlValidation.isValid = 'valid';
          watchedState.processStatus = 'validated';
        }
      });
  };

  const parser = () => {
    const domparser = new DOMParser();
    axios.get(`https://cors-anywhere.herokuapp.com/${userurl}`)
      .then((response) => {
        const dom = domparser.parseFromString(response.data, 'text/xml');
        const title = dom.querySelector('channel > title').textContent;
        const description = dom.querySelector('channel > description').textContent;
        const feed = { userurl, title, description };

        const posts = dom.getElementsByTagName('item');
        watchedState.posts = [...posts].map((post) => {
          const postTitle = post.querySelector('title').textContent;
          const postLink = post.querySelector('link').textContent;
          return { postTitle, postLink };
        });

        watchedState.feedList.push(feed);
        watchedState.urlisValid = '';
        urlInput.value = '';
        watchedState.message = 'URL was successfuly added to your feed. Congrats!';
        watchedState.processStatus = 'added';
      });
  };

  urlSubmit.addEventListener('click', validateURL);
};
