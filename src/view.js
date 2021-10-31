const renderToggle = (value) => {
  const buttonEN = document.getElementById('en');
  const buttonRU = document.getElementById('ru');

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

const renderInputGroup = (value) => {
  const submitButton = document.getElementById('submitButton');
  const input = document.getElementById('urlInput');

  if (value === 'loading') {
    input.setAttribute('readonly', true);
    submitButton.disabled = true;
  } else if (value !== 'added') {
    input.classList.add('border-danger');
    input.removeAttribute('readonly');
    submitButton.disabled = false;
  } else {
    input.value = '';
    input.classList.remove('border-danger');
    input.removeAttribute('readonly');
    submitButton.disabled = false;
  }
};

const renderMessage = (messageType, i18next) => {
  const message = document.getElementById('message');

  if (messageType !== 'success') {
    message.classList.remove('text-success', 'bg-white');
    message.classList.add('text-danger', 'bg-white');
  } else {
    message.classList.remove('text-danger', 'bg-white');
    message.classList.add('text-success', 'bg-white');
  }

  message.textContent = `${i18next.t(messageType)}`;
};

const renderFeeds = (feeds) => {
  feeds.forEach((feed) => {
    const hasFeed = document.getElementById(feed.feedId);

    if (hasFeed) {
      return;
    }

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
    newFeed.append(newFeedPosts);

    const currentFeeds = document.getElementById('feeds');
    currentFeeds.prepend(newFeed);
  });
};

const renderModal = (button, title, link, description, item, i18next) => {
  button.addEventListener('click', () => {
    const modal = document.getElementById('modal');

    const modalTitle = modal.querySelector('.modal-title');
    const modalBodyInput = modal.querySelector('.modal-body');
    modalTitle.textContent = title;
    modalBodyInput.textContent = description;

    const readMoreModalbutton = document.getElementById('readMoreModal');
    const closeModalbutton = document.getElementById('closeModal');
    readMoreModalbutton.textContent = i18next.t('readMore');
    readMoreModalbutton.setAttribute('onclick', `location.href='${link}'`);
    closeModalbutton.textContent = i18next.t('closeModal');

    item.classList.remove('font-weight-bold');
    item.classList.add('font-weight-normal');
  });
};

const renderPosts = (posts, i18next) => {
  posts.forEach((post) => {
    const hasPost = document.getElementById(post.postId);

    if (hasPost) {
      return;
    }

    const link = document.createElement('a');
    const { postTitle, postLink, postDescription, postId, feedId } = post;
    link.setAttribute('href', postLink);
    link.classList.add('font-weight-bold');
    link.textContent = postTitle;
    link.id = postId;

    const previewButton = document.createElement('button');
    previewButton.classList.add('btn', 'btn-primary');
    previewButton.setAttribute('type', 'button');
    previewButton.setAttribute('data-toggle', 'modal');
    previewButton.setAttribute('data-target', '#modal');
    previewButton.setAttribute('aria-label', '');
    previewButton.textContent = i18next.t('preview');
    renderModal(previewButton, postTitle, postLink, postDescription, link, i18next);

    const div = document.createElement('div');
    div.classList.add('d-flex', 'justify-content-between', 'mb-1');
    div.appendChild(link);
    div.appendChild(previewButton);

    const feedToUpdate = document.getElementById(feedId);
    const postsToupdate = feedToUpdate.getElementsByTagName('div')[0];
    postsToupdate.prepend(div);
  });
};

export {
  renderToggle,
  renderInputGroup,
  renderFeeds,
  renderMessage,
  renderPosts,
};
