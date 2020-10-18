const renderInput = (value) => {
  const urlInput = document.getElementById('urlInput');

  if (value === 'invalid') {
    urlInput.classList.add('border-danger');
  } else {
    urlInput.classList.remove('border-danger');
  }
};

const renderFeed = (feedlist, posts) => {
  const lastChannel = feedlist[feedlist.length - 1];

  const newchannel = document.createElement('div');
  const channelTitle = document.createElement('h2');
  const channelDescription = document.createElement('p');

  const { title, description } = lastChannel;
  channelTitle.textContent = title;
  channelDescription.textContent = description;

  newchannel.classList.add('d-flex', 'flex-column', 'col-sm-8', 'mt-4');
  newchannel.append(channelTitle);
  newchannel.append(channelDescription);

  posts.map((obj) => {
    const link = document.createElement('a');
    const { postTitle, postLink } = obj;
    link.setAttribute('href', postLink);
    link.textContent = postTitle;
    newchannel.append(link);
  });

  const feed = document.getElementById('feed');
  feed.append(newchannel);
};

const renderMessage = (state) => {
  const message = document.getElementById('message');
  message.textContent = state.message;

  if (state.processStatus === 'failed') {
    message.classList.remove('text-success', 'bg-white');
    message.classList.add('text-danger', 'bg-white');
  } else {
    message.classList.remove('text-danger', 'bg-white');
    message.classList.add('text-success', 'bg-white');
  }
};

export {
  renderInput,
  renderFeed,
  renderMessage,
};
