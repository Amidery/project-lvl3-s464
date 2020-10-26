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

const renderInput = (value) => {
  const input = document.getElementById('urlInput');

  if (value === 'invalid') {
    input.classList.add('border-danger');
  } else {
    input.classList.remove('border-danger');
  }
};

const renderMessage = (state) => {
  const message = document.getElementById('message');
  message.textContent = state.message;

  if (state.status === 'failed') {
    message.classList.remove('text-success', 'bg-white');
    message.classList.add('text-danger', 'bg-white');
  } else {
    message.classList.remove('text-danger', 'bg-white');
    message.classList.add('text-success', 'bg-white');
  }
};

const renderFeed = (feed) => {
  feed.forEach((channel) => {
    const hasChannel = document.getElementById(channel.id);
    if (hasChannel) {
      channel.posts.forEach((post) => {
        const hasPost = document.getElementById(post.postId);
        if (hasPost === null) {
          const link = document.createElement('a');
          const { postTitle, postLink, postId } = post;
          link.setAttribute('href', postLink);
          link.textContent = postTitle;
          link.id = postId;

          const currPosts = hasChannel.querySelector('div');
          currPosts.prepend(link);
        }
      });
      return;
    }

    const newchannel = document.createElement('div');
    newchannel.classList.add('col-sm-8', 'mt-4');

    const channelTitle = document.createElement('h2');
    const channelDescription = document.createElement('p');

    const { feedTitle, feedDescription, id } = channel;
    channelTitle.textContent = feedTitle;
    channelDescription.textContent = feedDescription;
    newchannel.id = id;

    const channelPosts = document.createElement('div');
    channel.posts.forEach((obj) => {
      const link = document.createElement('a');
      const { postTitle, postLink, postId } = obj;
      link.setAttribute('href', postLink);
      link.textContent = postTitle;
      link.id = postId;
      channelPosts.append(link);
    });

    channelPosts.classList.add('d-flex', 'flex-column');
    newchannel.append(channelTitle);
    newchannel.append(channelDescription);
    newchannel.append(channelPosts);

    const newFeed = document.getElementById('feed');
    newFeed.prepend(newchannel);
  });
};

export {
  renderToggle,
  renderInput,
  renderFeed,
  renderMessage,
};
