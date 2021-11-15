export default (data) => {
  const domparser = new DOMParser();
  const dom = domparser.parseFromString(data.contents, 'text/xml');
  if (dom.getElementsByTagName('parsererror').length !== 0) {
    throw new Error('Parse error');
  }

  const feedTitle = dom.querySelector('channel > title').textContent;
  const feedDescription = dom.querySelector('channel > description').textContent;
  const parsedFeed = { feedTitle, feedDescription };

  const items = [...dom.getElementsByTagName('item')].map((post) => {
    const title = post.querySelector('title').textContent;
    const link = post.querySelector('link').textContent;
    const description = post.querySelector('description').textContent;

    return {
      title,
      link,
      description,
    };
  });

  return { parsedFeed, items };
};
