const renderToggle = (value, buttonEN, buttonRU) => {
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

const renderInputGroup = (value, submitButton, input) => {
  if (value === 'loading' || value === 'validationOK') {
    input.setAttribute('readonly', true);
    submitButton.setAttribute('disabled', true);
  } else if (value === 'loaded' || value === 'updated') {
    input.value = ''; /* eslint no-param-reassign: "error" */
    input.classList.remove('border-danger');
    input.removeAttribute('readonly');
    submitButton.removeAttribute('disabled');
  } else if (value !== null) {
    input.classList.add('border-danger');
    input.removeAttribute('readonly');
    submitButton.removeAttribute('disabled');
  }
};

const renderMessage = (state, i18next) => {
  const message = document.getElementById('message');
  message.textContent = `${i18next.t(state.messageType)}`;

  if (state.loadingStatus !== 'loadingFailed' && state.validationStatus !== 'validationFailed' && state.loadingStatus !== 'updatingFailed') {
    message.classList.remove('text-danger', 'bg-white');
    message.classList.add('text-success', 'bg-white');
  } else {
    message.classList.remove('text-success', 'bg-white');
    message.classList.add('text-danger', 'bg-white');
  }
};

const renderFeeds = (feeds) => {
  const feedsContainer = document.getElementById('feeds');
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

const renderModal = (post, i18next) => {
  const modal = document.getElementById('modal');

  const modalTitle = modal.querySelector('.modal-title');
  const modalBodyInput = modal.querySelector('.modal-body');
  modalTitle.textContent = post.title;
  modalBodyInput.textContent = post.description;

  const readMoreModalbutton = document.getElementById('readMoreModal');
  const closeModalbutton = document.getElementById('closeModal');
  readMoreModalbutton.textContent = i18next.t('readMore');
  readMoreModalbutton.setAttribute('onclick', `location.href='${post.link}'`);
  closeModalbutton.textContent = i18next.t('closeModal');
};

const renderPosts = (posts, i18next) => {
  const postsLists = document.querySelectorAll('#posts');
  postsLists.forEach((list) => { list.innerHTML = ''; });

  posts.forEach((post) => {
    const newPost = document.createElement('a');
    const {
      title,
      link,
      postId,
      status,
      feedId,
    } = post;

    newPost.setAttribute('href', link);

    if (status === 'new') {
      newPost.classList.add('font-weight-bold', 'fw-bold');
    } else {
      newPost.classList.remove('font-weight-bold', 'fw-bold');
      newPost.classList.add('font-weight-normal', 'fw-normal');
    }

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
