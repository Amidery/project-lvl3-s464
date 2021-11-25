const renderToggle = (value, buttonEN, buttonRU, submitButton, i18next) => {
  submitButton.value = i18next.t('button');

  if (value === 'ru') {
    buttonRU.classList.remove('btn-secondary');
    buttonRU.classList.add('btn-warning');
    buttonEN.classList.remove('btn-warning');
    buttonEN.classList.add('btn-secondary');
  } else {
    buttonRU.classList.add('btn-secondary');
    buttonRU.classList.remove('btn-warning');
    buttonEN.classList.add('btn-warning');
    buttonEN.classList.remove('btn-secondary');
  }
};

const renderInputGroup = (submitButton, input, status = null) => {
  input.setAttribute('readonly', true);
  submitButton.setAttribute('disabled', true);

  if (status) {
    input.value = ''; /* eslint no-param-reassign: "error" */
    input.classList.remove('border-danger');
    input.removeAttribute('readonly');
    submitButton.removeAttribute('disabled');
  } else if (status === false) {
    input.classList.add('border-danger');
    input.removeAttribute('readonly');
    submitButton.removeAttribute('disabled');
  }
};

const renderMessage = (state, message, i18next, status = null) => {
  message.textContent = `${i18next.t(state.messageType)}`;
  message.classList.remove('text-danger', 'bg-white', 'text-success');

  if (status) {
    message.classList.add('text-success', 'bg-white');
  } else if (status === false) {
    message.classList.add('text-danger', 'bg-white');
  }
};

const renderFeeds = (feeds, feedsContainer) => {
  feedsContainer.innerHTML = '';

  feeds.forEach((feed) => {
    const newFeed = document.createElement('div');
    newFeed.classList.add('col-sm-8', 'mt-4');

    const newFeedTitle = document.createElement('h2');
    const newFeedDescription = document.createElement('p');

    const { feedTitle, feedDescription, feedId } = feed;
    newFeedTitle.textContent = feedTitle;
    newFeedDescription.textContent = feedDescription;
    newFeed.id = feedId;
    newFeed.append(newFeedTitle);
    newFeed.append(newFeedDescription);

    const newFeedPosts = document.createElement('div');
    newFeedPosts.classList.add('d-flex', 'flex-column');
    newFeedPosts.setAttribute('id', 'posts');
    newFeed.append(newFeedPosts);

    feedsContainer.prepend(newFeed);
  });
};

const renderModal = (post, modal, i18next) => {
  const modalTitle = modal.querySelector('.modal-title');
  const modalBodyInput = modal.querySelector('.modal-body');
  modalTitle.textContent = post.title;
  modalBodyInput.textContent = post.description;

  const readMoreModalbutton = modal.querySelector('#readMoreModal');
  const closeModalbutton = modal.querySelector('#closeModal');
  readMoreModalbutton.textContent = i18next.t('readMore');
  readMoreModalbutton.setAttribute('onclick', `location.href='${post.link}'`);
  closeModalbutton.textContent = i18next.t('closeModal');
};

const renderPosts = (postsStatus, posts, i18next) => {
  const postsContainers = document.querySelectorAll('#posts');
  postsContainers.forEach((list) => { list.innerHTML = ''; });

  posts.forEach((post) => {
    const newPost = document.createElement('a');
    const {
      title,
      link,
      postId,
      feedId,
    } = post;

    const { status } = postsStatus.find((item) => item.postId === postId);

    if (status === 'new') {
      newPost.classList.add('font-weight-bold', 'fw-bold');
    } else {
      newPost.classList.remove('font-weight-bold', 'fw-bold');
      newPost.classList.add('font-weight-normal', 'fw-normal');
    }

    newPost.setAttribute('href', link);
    newPost.textContent = title;
    newPost.id = postId;

    const previewButton = document.createElement('button');
    previewButton.classList.add('btn', 'btn-primary');
    previewButton.setAttribute('type', 'button');
    previewButton.setAttribute('data-toggle', 'modal');
    previewButton.setAttribute('data-target', '#modal');
    previewButton.setAttribute('aria-label', '');
    previewButton.textContent = i18next.t('preview');

    const div = document.createElement('div');
    div.classList.add('d-flex', 'justify-content-between', 'mb-1');
    div.appendChild(newPost);
    div.appendChild(previewButton);

    const feedToUpdate = document.getElementById(feedId);
    const postsToUpdate = feedToUpdate.getElementsByTagName('div')[0];
    postsToUpdate.prepend(div);
  });
};

export {
  renderToggle,
  renderInputGroup,
  renderFeeds,
  renderMessage,
  renderPosts,
  renderModal,
};
